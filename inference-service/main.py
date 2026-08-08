"""
main.py — Inference microservice for the meme caption generator.

Wraps the fine-tuned GPT-2 model produced by meme_caption_pipeline.py and
exposes it over HTTP so the Java/Spring Boot backend never has to touch
PyTorch directly. Also exposes an OCR endpoint (pytesseract) used for the
"upload a meme, extract its text" feature.

Run locally:
    uvicorn main:app --reload --port 8000

Environment variables:
    MODEL_DIR   Path to the fine-tuned model directory (default: ./model_output)
"""

import os
import re
import io

import torch
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer
from PIL import Image
import pytesseract

BOS = "<|capbos|>"
EOS = "<|capeos|>"
PAD = "<|cappad|>"

MODEL_DIR = os.environ.get("MODEL_DIR", "./model_output")

app = FastAPI(title="Meme Caption Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

_tokenizer = None
_model = None


def get_model():
    """Lazy-load the model on first request so the container starts fast."""
    global _tokenizer, _model
    if _model is None:
        if not os.path.isdir(MODEL_DIR):
            raise RuntimeError(
                f"MODEL_DIR '{MODEL_DIR}' not found. Train a model with "
                f"meme_caption_pipeline.py and mount/bake it into the container."
            )
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
        _model = AutoModelForCausalLM.from_pretrained(MODEL_DIR)
        _model.eval()
        if torch.cuda.is_available():
            _model.to("cuda")
    return _tokenizer, _model


class GenerateRequest(BaseModel):
    prompt: str = Field(default="", max_length=200)
    n: int = Field(default=5, ge=1, le=30)
    temperature: float = Field(default=0.75, ge=0.1, le=2.0)
    top_k: int = Field(default=40, ge=0, le=200)
    top_p: float = Field(default=0.90, ge=0.0, le=1.0)
    max_new_tokens: int = Field(default=25, ge=5, le=80)
    repetition_penalty: float = Field(default=1.1, ge=1.0, le=2.0)


class GenerateResponse(BaseModel):
    captions: list[str]


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": _model is not None}


@app.post("/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest):
    try:
        tokenizer, model = get_model()
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    device = next(model.parameters()).device
    text = f"{BOS} {req.prompt.strip()}" if req.prompt.strip() else BOS

    inputs = tokenizer(text, return_tensors="pt")
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)

    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            do_sample=True,
            max_new_tokens=req.max_new_tokens,
            temperature=req.temperature,
            top_k=req.top_k,
            top_p=req.top_p,
            repetition_penalty=req.repetition_penalty,
            no_repeat_ngram_size=3,
            num_return_sequences=req.n,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id,
        )

    captions = []
    for output in outputs:
        generated = output[input_ids.shape[1]:]
        decoded = tokenizer.decode(generated, skip_special_tokens=False)
        decoded = decoded.split(EOS)[0]
        decoded = decoded.replace(BOS, "").replace(PAD, "")
        decoded = decoded.encode("ascii", "ignore").decode()
        decoded = re.sub(r"\s+", " ", decoded).strip()
        if decoded:
            captions.append(decoded)

    return GenerateResponse(captions=captions)


@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, or WEBP images are supported")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image")

    try:
        text = pytesseract.image_to_string(image)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {e}")

    text = re.sub(r"\s+", " ", text).strip()
    return {"text": text}
