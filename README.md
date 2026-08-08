# Captioner — AI Meme Caption Generator

A full-stack app around the fine-tuned GPT-2 model from `meme_caption_pipeline.py`:

- **`frontend/`** — React (Vite) + Tailwind. Auth, a gallery with likes, favorites,
  and a generate page exposing every model knob (temperature, top-k, top-p, max tokens,
  repetition penalty, caption count 1–30) plus meme image upload with OCR.
- **`backend/`** — Java Spring Boot + MySQL (JPA/Hibernate). JWT auth, gallery pagination,
  likes, favorites, and a proxy to the inference service.
- **`inference-service/`** — Python FastAPI microservice that loads the fine-tuned model
  and exposes `/generate` and `/ocr`. Java doesn't run PyTorch directly, so the backend
  calls this service over HTTP.

```
meme-app/
├── frontend/            React app
├── backend/              Spring Boot API + MySQL
├── inference-service/    FastAPI wrapper around the fine-tuned model
├── docker-compose.yml    Local dev: all four services together
└── DEPLOYMENT.md         Step-by-step cloud deployment (Render + Vercel)
```

## Quick start (local, Docker)

```bash
# 1. Drop your trained model into inference-service/model_output/
docker compose up --build
```

Then open http://localhost:5173.

See `DEPLOYMENT.md` for cloud deployment and for running each service natively
without Docker.

## Feature summary

- **Auth** — JWT-based signup/login (`/api/auth/*`).
- **Generate** — tune temperature, top-k, top-p, max new tokens, repetition penalty,
  and batch size (1–30) live from the UI; results save to the gallery automatically
  (toggle-able).
- **OCR upload** — drop in a meme image, the inference service extracts its text via
  Tesseract, and that text becomes the generation prompt.
- **Gallery** — public, paginated, sortable by recent or most-liked.
- **Likes & Favorites** — one like per user per caption (enforced at the DB level);
  favorites are private to each account.
