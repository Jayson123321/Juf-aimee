# MkDocs with Docker Compose

Build and preview the documentation without installing Python locally.

## Prerequisites
- Docker and Docker Compose v2.

## Build the image
```bash
docker compose build mkdocs
```

## Live preview
```bash
docker compose up mkdocs
```
- Opens on http://localhost:8000
- Hot-reloads on changes under this repository.

## Build static site
```bash
docker compose run --rm mkdocs \
  sh -c "pip install -e /workspace/mdocotion && mkdocs build --site-dir public"
```
- Outputs to `public/` (GitLab Pages compatible).

## Notes
- Dependencies are in `requirements.txt` (used by CI and the Docker image).
- The container installs the local `mdocotion` package in editable mode before running MkDocs to load the custom macros.
