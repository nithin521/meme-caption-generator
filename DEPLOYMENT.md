# Deployment Guide

Three pieces to deploy, in this order: **MySQL → inference service → Spring Boot backend → React frontend**.

---

## 0. Prerequisites

- A trained model directory (`model_output/`) produced by `meme_caption_pipeline.py`. Copy it into
  `inference-service/model_output/` before deploying the inference service — the FastAPI app loads it from
  the `MODEL_DIR` env var.
- Accounts: [Render](https://render.com) (or [Railway](https://railway.app)) for backend/DB/inference,
  and [Vercel](https://vercel.com) (or [Netlify](https://netlify.com)) for the frontend.
- Push this project to a GitHub repo — both platforms deploy from a repo.

---

## 1. MySQL database (Render)

1. Render dashboard → **New → PostgreSQL**... actually pick **New → MySQL** if available in your region,
   otherwise use **Railway → New → MySQL** (Railway has first-class managed MySQL) or **PlanetScale** (free MySQL-compatible tier).
2. Note the connection details: host, port, database name, username, password.
3. Build a JDBC URL:
   ```
   jdbc:mysql://<HOST>:<PORT>/<DATABASE>?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true
   ```

---

## 2. Inference service (Render Web Service, Docker)

1. Render dashboard → **New → Web Service** → connect your repo → set **Root Directory** to `inference-service`.
2. Environment: **Docker** (Render auto-detects the `Dockerfile`).
3. Instance type: pick one with **at least 2GB RAM** — a fine-tuned GPT-2 loads comfortably on CPU, just not on the free 512MB tier.
4. Environment variables:
   - `MODEL_DIR=/app/model_output`
5. Because Render's filesystem is ephemeral and ignores files outside the repo, either:
   - commit `model_output/` into `inference-service/model_output/` in the repo (simplest, works well since GPT-2-small fine-tunes are only ~500MB), or
   - add a build step that downloads the model from cloud storage (S3/GCS) into `MODEL_DIR` before `uvicorn` starts.
6. Deploy. Confirm it's healthy: `curl https://<inference-service>.onrender.com/health`.

---

## 3. Spring Boot backend (Render Web Service, Docker)

1. Render dashboard → **New → Web Service** → same repo → **Root Directory** = `backend`.
2. Environment: **Docker**.
3. Environment variables:
   | Key | Value |
   |---|---|
   | `DB_URL` | JDBC URL from step 1 |
   | `DB_USERNAME` | your DB username |
   | `DB_PASSWORD` | your DB password |
   | `INFERENCE_SERVICE_URL` | `https://<inference-service>.onrender.com` |
   | `JWT_SECRET` | a long random string (`openssl rand -base64 48`) |
   | `ALLOWED_ORIGINS` | your frontend URL, e.g. `https://captioner.vercel.app` |
   | `PORT` | `8080` (Render sets this automatically too) |
4. Deploy. Confirm: `curl https://<backend>.onrender.com/api/captions/gallery`.
5. **Persistent uploads**: Render's disk is ephemeral on redeploy. For production, swap
   `FileStorageService.java` to upload to S3/Cloudinary instead of local disk — the interface
   (`store(MultipartFile) -> URL`) is already isolated so this is a single-file change.

---

## 4. React frontend (Vercel)

1. Vercel dashboard → **Add New → Project** → import the repo → set **Root Directory** to `frontend`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`, Output directory: `dist` (Vercel usually auto-fills these).
4. Environment variable:
   - `VITE_API_BASE_URL=https://<backend>.onrender.com`
5. Deploy. Vercel gives you a URL like `https://captioner.vercel.app`.
6. Go back to the backend's `ALLOWED_ORIGINS` env var on Render and set it to this exact URL, then redeploy the backend so CORS allows it.

**Netlify alternative:** same idea — root directory `frontend`, build command `npm run build`, publish directory `dist`, and the same `VITE_API_BASE_URL` env var under Site settings → Environment variables.

---

## 5. Smoke test

1. Visit the frontend URL → **Sign up** → creates a user via `/api/auth/register`.
2. Go to **Generate** → set a prompt and params → **Generate** → should hit backend → inference service → return captions.
3. Try the **image upload** path → confirms OCR round-trip through the inference service.
4. Like / favorite a caption → check **Favorites** page.
5. Open **Gallery** → toggle **Recent / Top liked**.

---

## Local development (Docker Compose)

For local end-to-end testing before deploying:

```bash
# 1. Put your trained model here first:
#    inference-service/model_output/

docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080
- Inference service: http://localhost:8000
- MySQL: localhost:3306 (user `root`, password `root`, db `memeapp`)

Or run each piece natively without Docker:

```bash
# Inference service
cd inference-service
pip install -r requirements.txt
MODEL_DIR=./model_output uvicorn main:app --reload --port 8000

# Backend (needs a local MySQL running on 3306, db `memeapp`)
cd backend
mvn spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
```
