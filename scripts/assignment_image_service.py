import os
import time
from pathlib import Path
from typing import Optional
from urllib.parse import urlparse
from uuid import uuid4

import torch
from diffusers import FluxKontextPipeline
from diffusers.utils import load_image
from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel


MODEL_PATH = os.getenv("ASSIGNMENT_IMAGE_MODEL_PATH", "/mnt/scratch/models/FLUX.1-Kontext-dev")
OUTPUT_DIR = Path(os.getenv("ASSIGNMENT_IMAGE_OUTPUT_DIR", "/mnt/scratch/generated/assignment-images"))
STATIC_ROUTE = os.getenv("ASSIGNMENT_IMAGE_STATIC_ROUTE", "/generated/assignment-images")
ESTIMATED_SECONDS = int(os.getenv("ASSIGNMENT_IMAGE_ESTIMATED_SECONDS", "70"))
WIDTH = int(os.getenv("ASSIGNMENT_IMAGE_WIDTH", "1024"))
HEIGHT = int(os.getenv("ASSIGNMENT_IMAGE_HEIGHT", "768"))
STEPS = int(os.getenv("ASSIGNMENT_IMAGE_STEPS", "28"))
GUIDANCE_SCALE = float(os.getenv("ASSIGNMENT_IMAGE_GUIDANCE_SCALE", "2.5"))

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Assignment Image Service")
app.mount(STATIC_ROUTE, StaticFiles(directory=str(OUTPUT_DIR)), name="assignment-images")

_PIPE = None


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


def get_pipe() -> FluxKontextPipeline:
    global _PIPE

    if _PIPE is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        dtype = torch.bfloat16 if device == "cuda" else torch.float32

        pipe = FluxKontextPipeline.from_pretrained(MODEL_PATH, torch_dtype=dtype)
        if device == "cuda" and os.getenv("ASSIGNMENT_IMAGE_CPU_OFFLOAD", "0") == "1":
            pipe.enable_model_cpu_offload()
        else:
            pipe.to(device)

        _PIPE = pipe

    return _PIPE


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


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/generate")
def generate(request: Request, body: ImageRequest):
    started_at = time.time()

    try:
        pipe = get_pipe()
        previous_image_path = resolve_previous_image(body.previous_image_url)
        source_image = load_image(str(previous_image_path)).convert("RGB") if previous_image_path else None

        student_dir = OUTPUT_DIR / body.student_id
        student_dir.mkdir(parents=True, exist_ok=True)
        file_name = f"{int(time.time())}-{uuid4().hex[:8]}.png"
        output_path = student_dir / file_name

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
        }
    except Exception as exc:  # pragma: no cover - runtime service
        raise HTTPException(status_code=500, detail=str(exc)) from exc
