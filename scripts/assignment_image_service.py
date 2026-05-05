import gc
import os
import time
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse
from uuid import uuid4

import torch
from diffusers import FluxKontextPipeline, StableDiffusion3Pipeline
from diffusers.utils import load_image
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


def _normalize_family(value: Optional[str], fallback: str) -> str:
    return value.strip().lower() if value and value.strip() else fallback


# 24GB-vriendelijke standaard:
# - eerste render: Stable Diffusion 3.5 Medium
# - opnieuw maken: ook Stable Diffusion 3.5 Medium
# Wil je later experimenteren met een zwaarder edit-model zoals FLUX?
# Zet dan expliciet:
#   ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY=flux
#   ASSIGNMENT_IMAGE_EDIT_MODEL_PATH=/mnt/scratch/models/FLUX.1-Kontext-dev
LEGACY_PRIMARY_MODEL_PATH = os.getenv("ASSIGNMENT_IMAGE_MODEL_PATH")
LEGACY_PRIMARY_MODEL_FAMILY = os.getenv("ASSIGNMENT_IMAGE_MODEL_FAMILY")
LEGACY_FALLBACK_MODEL_PATH = os.getenv("ASSIGNMENT_IMAGE_FALLBACK_MODEL_PATH")
LEGACY_FALLBACK_MODEL_FAMILY = os.getenv("ASSIGNMENT_IMAGE_FALLBACK_MODEL_FAMILY")

DEFAULT_RENDER_MODEL_FAMILY = _normalize_family(
    os.getenv("ASSIGNMENT_IMAGE_RENDER_MODEL_FAMILY"),
    _normalize_family(
        LEGACY_FALLBACK_MODEL_FAMILY,
        _normalize_family(LEGACY_PRIMARY_MODEL_FAMILY, "sd3"),
    ),
)
DEFAULT_RENDER_MODEL_PATH = (
    os.getenv("ASSIGNMENT_IMAGE_RENDER_MODEL_PATH")
    or LEGACY_FALLBACK_MODEL_PATH
    or LEGACY_PRIMARY_MODEL_PATH
    or "/mnt/scratch/models/stable-diffusion-3.5-medium"
)
DEFAULT_EDIT_MODEL_FAMILY = _normalize_family(
    os.getenv("ASSIGNMENT_IMAGE_EDIT_MODEL_FAMILY"),
    DEFAULT_RENDER_MODEL_FAMILY,
)
DEFAULT_EDIT_MODEL_PATH = (
    os.getenv("ASSIGNMENT_IMAGE_EDIT_MODEL_PATH")
    or DEFAULT_RENDER_MODEL_PATH
)

OUTPUT_DIR = Path(os.getenv("ASSIGNMENT_IMAGE_OUTPUT_DIR", "/mnt/scratch/generated/assignment-images"))
STATIC_ROUTE = os.getenv("ASSIGNMENT_IMAGE_STATIC_ROUTE", "/generated/assignment-images")
ESTIMATED_SECONDS = int(os.getenv("ASSIGNMENT_IMAGE_ESTIMATED_SECONDS", "70"))
WIDTH = int(os.getenv("ASSIGNMENT_IMAGE_WIDTH", "1024"))
HEIGHT = int(os.getenv("ASSIGNMENT_IMAGE_HEIGHT", "768"))
STEPS = int(os.getenv("ASSIGNMENT_IMAGE_STEPS", "28"))
GUIDANCE_SCALE = float(os.getenv("ASSIGNMENT_IMAGE_GUIDANCE_SCALE", "2.5"))
UNLOAD_AFTER_REQUEST = os.getenv("ASSIGNMENT_IMAGE_UNLOAD_AFTER_REQUEST", "1") == "1"

MODEL_LABELS = {
    "sd3": "Stable Diffusion 3.5 Medium",
    "flux": "FLUX.1 Kontext [dev]",
}

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Assignment Image Service")
app.mount(STATIC_ROUTE, StaticFiles(directory=str(OUTPUT_DIR)), name="assignment-images")

_PIPES: dict[tuple[str, str], Any] = {}


class ImageRequest(BaseModel):
    student_id: str
    student_name: str
    focus_area: str
    bloom_level: str
    assignment_title: str
    assignment_text: str
    rationale: Optional[str] = None
    interests: list[str] = []
    prompt: str
    previous_image_url: Optional[str] = None


def get_pipe(model_family: str, model_path: str):
    global _PIPES

    key = (model_family, model_path)
    if key in _PIPES:
        return _PIPES[key]

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.float16 if device == "cuda" else torch.float32

    if device == "cuda":
        torch.cuda.empty_cache()

    if model_family == "sd3":
        pipe = StableDiffusion3Pipeline.from_pretrained(model_path, torch_dtype=dtype)
    else:
        pipe = FluxKontextPipeline.from_pretrained(model_path, torch_dtype=dtype)

    if device == "cuda" and os.getenv("ASSIGNMENT_IMAGE_CPU_OFFLOAD", "0") == "1":
        if hasattr(pipe, "enable_model_cpu_offload"):
            pipe.enable_model_cpu_offload()
        else:
            pipe.to(device)
    else:
        pipe.to(device)

    _PIPES[key] = pipe
    return pipe


def release_pipe(model_family: str, model_path: str) -> None:
    global _PIPES

    key = (model_family, model_path)
    pipe = _PIPES.pop(key, None)
    if pipe is None:
        return

    try:
        if hasattr(pipe, "to"):
            pipe.to("cpu")
    except Exception:
        pass

    del pipe
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()
        if hasattr(torch.cuda, "ipc_collect"):
            torch.cuda.ipc_collect()


def resolve_previous_image(previous_image_url: Optional[str]) -> Optional[Path]:
    if not previous_image_url:
        return None

    parsed = urlparse(previous_image_url)
    candidate_path = parsed.path or previous_image_url
    if not candidate_path.startswith(STATIC_ROUTE):
        return None

    relative = candidate_path[len(STATIC_ROUTE):].lstrip("/")
    resolved = (OUTPUT_DIR / relative).resolve()
    try:
        resolved.relative_to(OUTPUT_DIR.resolve())
    except ValueError:
        return None

    return resolved if resolved.exists() else None


def choose_model(previous_image_path: Optional[Path]) -> tuple[str, str]:
    if previous_image_path is not None:
        return DEFAULT_EDIT_MODEL_FAMILY, DEFAULT_EDIT_MODEL_PATH
    return DEFAULT_RENDER_MODEL_FAMILY, DEFAULT_RENDER_MODEL_PATH


@app.get("/health")
def health():
    return {
        "ok": True,
        "render_model_family": DEFAULT_RENDER_MODEL_FAMILY,
        "edit_model_family": DEFAULT_EDIT_MODEL_FAMILY,
    }


@app.post("/generate")
def generate(request: Request, body: ImageRequest):
    started_at = time.time()
    previous_image_path = resolve_previous_image(body.previous_image_url)
    model_family, model_path = choose_model(previous_image_path)

    try:
        pipe = get_pipe(model_family, model_path)
        source_image = load_image(str(previous_image_path)).convert("RGB") if previous_image_path else None

        if model_family == "flux" and source_image is None:
            raise HTTPException(
                status_code=400,
                detail=(
                    "FLUX Kontext heeft een bestaande afbeelding nodig voor bewerking. "
                    "Gebruik voor een eerste render een text-to-image model zoals Stable Diffusion 3.5 Medium."
                ),
            )

        student_dir = OUTPUT_DIR / body.student_id
        student_dir.mkdir(parents=True, exist_ok=True)
        file_name = f"{int(time.time())}-{uuid4().hex[:8]}.png"
        output_path = student_dir / file_name

        if model_family == "sd3":
            result = pipe(
                prompt=body.prompt,
                negative_prompt="blurry, low quality, distorted, text, watermark",
                width=WIDTH,
                height=HEIGHT,
                guidance_scale=GUIDANCE_SCALE,
                num_inference_steps=STEPS,
            ).images[0]
        else:
            result = pipe(
                prompt=body.prompt,
                image=source_image,
                width=None if source_image is not None else WIDTH,
                height=None if source_image is not None else HEIGHT,
                guidance_scale=GUIDANCE_SCALE,
                num_inference_steps=STEPS,
            ).images[0]

        result.save(output_path)

        relative = output_path.relative_to(OUTPUT_DIR).as_posix()
        image_url = str(request.base_url).rstrip("/") + f"{STATIC_ROUTE}/{relative}"

        return {
            "image_url": image_url,
            "prompt": body.prompt,
            "duration_ms": int((time.time() - started_at) * 1000),
            "estimated_seconds": ESTIMATED_SECONDS,
            "model_family_used": model_family,
            "model_label_used": MODEL_LABELS.get(model_family, model_family.upper()),
        }
    except Exception as exc:  # pragma: no cover - runtime service
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        if UNLOAD_AFTER_REQUEST:
            release_pipe(model_family, model_path)
