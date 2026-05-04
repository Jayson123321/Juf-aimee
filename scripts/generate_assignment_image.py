import argparse
import json
import os
import time

import torch
from diffusers import FluxKontextPipeline, StableDiffusion3Pipeline
from diffusers.utils import load_image


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate assignment illustration with FLUX Kontext.")
    parser.add_argument("--model-path", required=True)
    parser.add_argument("--output-path", required=True)
    parser.add_argument("--prompt", required=True)
    parser.add_argument("--input-image")
    parser.add_argument("--width", type=int, default=1024)
    parser.add_argument("--height", type=int, default=768)
    parser.add_argument("--steps", type=int, default=28)
    parser.add_argument("--guidance-scale", type=float, default=2.5)
    parser.add_argument("--seed", type=int)
    return parser


def main() -> None:
  args = build_parser().parse_args()
  torch.set_grad_enabled(False)

  device = "cuda" if torch.cuda.is_available() else "cpu"
  dtype = torch.float16 if device == "cuda" else torch.float32
  model_family = os.getenv("ASSIGNMENT_IMAGE_MODEL_FAMILY", "flux").lower()
  fallback_model_path = os.getenv("ASSIGNMENT_IMAGE_FALLBACK_MODEL_PATH", "").strip()
  fallback_model_family = os.getenv("ASSIGNMENT_IMAGE_FALLBACK_MODEL_FAMILY", "sd3").lower()

  started_at = time.time()
  image = load_image(args.input_image).convert("RGB") if args.input_image else None
  selected_family = model_family
  selected_model_path = args.model_path

  if model_family == "flux" and image is None:
    if fallback_model_path:
      selected_family = fallback_model_family
      selected_model_path = fallback_model_path
    else:
      raise RuntimeError(
        "FLUX Kontext heeft een bestaande afbeelding nodig voor bewerking. "
        "Configureer ASSIGNMENT_IMAGE_FALLBACK_MODEL_PATH voor een eerste render "
        "(bijvoorbeeld Stable Diffusion 3.5 Medium)."
      )

  if selected_family == "sd3":
    pipe = StableDiffusion3Pipeline.from_pretrained(selected_model_path, torch_dtype=dtype)
  else:
    pipe = FluxKontextPipeline.from_pretrained(selected_model_path, torch_dtype=dtype)

  if device == "cuda" and os.getenv("ASSIGNMENT_IMAGE_CPU_OFFLOAD", "0") == "1":
    if hasattr(pipe, "enable_model_cpu_offload"):
      pipe.enable_model_cpu_offload()
    else:
      pipe.to(device)
  else:
    pipe.to(device)

  generator = None
  if args.seed is not None:
    generator = torch.Generator(device="cpu").manual_seed(args.seed)

  if selected_family == "sd3":
    output = pipe(
        prompt=args.prompt,
        negative_prompt="blurry, low quality, distorted, text, watermark",
        width=args.width,
        height=args.height,
        guidance_scale=args.guidance_scale,
        num_inference_steps=args.steps,
        generator=generator,
    ).images[0]
  else:
    output = pipe(
        prompt=args.prompt,
        image=image,
        width=None if image is not None else args.width,
        height=None if image is not None else args.height,
        guidance_scale=args.guidance_scale,
        num_inference_steps=args.steps,
        generator=generator,
    ).images[0]

  os.makedirs(os.path.dirname(args.output_path), exist_ok=True)
  output.save(args.output_path)

  result = {
      "output_path": args.output_path,
      "prompt": args.prompt,
      "duration_ms": int((time.time() - started_at) * 1000),
  }
  print(json.dumps(result))


if __name__ == "__main__":
  main()
