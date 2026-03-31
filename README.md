This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
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
