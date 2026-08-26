# 😂 AI Meme Caption Generator

A deep learning project that generates short, humorous, and social-media-style meme captions using a **fine-tuned GPT-2 language model**.

The model was fine-tuned on a custom meme-caption dataset and deployed through **Hugging Face Spaces** with an interactive Gradio interface.

---

## 🚀 Project Overview

The project generates meme captions from a user-provided prompt or without a prompt.

```text
User Prompt
     │
     ▼
Fine-Tuned GPT-2
     │
     ├── Temperature
     ├── Top-K
     ├── Top-P
     └── Max New Tokens
     │
     ▼
Multiple Meme Captions
```

The model learns common meme-writing patterns such as:

- `When ...`
- `Me when ...`
- `POV: ...`
- `How it feels when ...`
- `That one friend who ...`

---

## 🤖 Fine-Tuned Model

The caption generator is based on **GPT-2** and was fine-tuned specifically for meme-caption generation.

### Model Details

| Property | Details |
|---|---|
| **Base Model** | GPT-2 |
| **Task** | Meme Caption Generation |
| **Language** | English |
| **Framework** | PyTorch |
| **Library** | 🤗 Transformers |
| **Model Type** | Autoregressive Language Model |
| **Fine-Tuning** | Supervised Fine-Tuning |
| **Format** | Safetensors |

### 🤗 Hugging Face Model

The trained model is available here:

**[Meme Caption Generator — Hugging Face Model](https://huggingface.co/nithin521/Meme_Caption_Generator)**

---

## 🌐 Live Demo

The trained model is deployed as an interactive **Gradio application on Hugging Face Spaces**.

### 🚀 Try the Live Application

**[Open AI Meme Caption Generator](https://huggingface.co/spaces/nithin521/Meme-caption-generation)**

The application allows users to:

- Enter a custom meme prompt
- Generate multiple captions
- Generate captions without a prompt
- Adjust generation parameters
- Experiment with different levels of creativity

---

## 🎛️ Generation Controls

The application provides controls for the main text-generation parameters.

| Parameter | Description |
|---|---|
| **Temperature** | Controls randomness and creativity |
| **Top-K** | Limits token selection to the top K candidates |
| **Top-P** | Controls nucleus sampling |
| **Max New Tokens** | Controls maximum generated caption length |

### Recommended Starting Values

```text
Temperature:      0.75
Top-K:            40
Top-P:            0.90
Max New Tokens:   25
```

Higher temperature generally produces more varied outputs, while lower temperature produces more predictable outputs.

---

## 🧠 Model Training

A custom meme-caption dataset was prepared and cleaned before fine-tuning.

### Dataset Preparation Pipeline

```text
Meme Images
      │
      ▼
YOLO Text Detection
      │
      ▼
Caption Region Cropping
      │
      ▼
OCR / Text Extraction
      │
      ▼
Text Cleaning
      │
      ▼
Duplicate Removal
      │
      ▼
Training Dataset
      │
      ▼
GPT-2 Fine-Tuning
```

A YOLO-based text detection model was developed to identify meme-text regions from meme images. The detected regions were cropped to improve the quality of caption extraction before creating the language-model training dataset.

---

## 🔤 Caption Formatting

During training, captions were structured using custom special tokens:

```text
<|capbos|> meme caption <|capeos|>
```

Where:

- `<|capbos|>` — Beginning of caption
- `<|capeos|>` — End of caption
- `<|cappad|>` — Padding token

This format helps the model learn clear caption boundaries during generation.

---

## 💻 Using the Model

The model can be loaded directly using Hugging Face Transformers.

```python
from transformers import AutoTokenizer, AutoModelForCausalLM

model_id = "nithin521/Meme_Caption_Generator"

tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

prompt = "When you finally get your salary"

text = "<|capbos|> " + prompt

inputs = tokenizer(
    text,
    return_tensors="pt"
)

outputs = model.generate(
    **inputs,
    max_new_tokens=25,
    temperature=0.75,
    top_k=40,
    top_p=0.90,
    do_sample=True,
    repetition_penalty=1.1,
    no_repeat_ngram_size=3,
    num_return_sequences=5,
    eos_token_id=tokenizer.eos_token_id,
    pad_token_id=tokenizer.pad_token_id
)

for output in outputs:

    caption = tokenizer.decode(
        output,
        skip_special_tokens=False
    )

    caption = caption.split("<|capeos|>")[0]
    caption = caption.replace("<|capbos|>", "").strip()

    print(caption)
```

---

## 📊 Example

### Input

```text
When you finally get your salary
```

### Possible Generated Captions

```text
When you finally get your salary and your bills were waiting for you.

Me checking my bank account after getting paid.

POV: You finally get paid but somehow you're still broke.
```

> Generated captions are stochastic and may vary between runs.

---

## 🏗️ Project Architecture

The current project focuses on the **AI model, dataset pipeline, and model deployment**.

```text
                    ┌─────────────────────┐
                    │     User Prompt     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Gradio Interface  │
                    │  Hugging Face Space │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Fine-Tuned GPT-2  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Meme Caption Output │
                    └─────────────────────┘
```

---

## 🛠️ Technologies Used

- **Python**
- **PyTorch**
- **Hugging Face Transformers**
- **Hugging Face Hub**
- **GPT-2**
- **Gradio**
- **Ultralytics YOLO**
- **OCR**
- **Safetensors**

---

## ✨ Key Features

### 📝 Prompt-Based Generation

Enter a topic, situation, or meme idea and generate multiple caption variations.

### 🎲 Random Caption Generation

Generate meme captions without providing a specific prompt.

### 🎛️ Adjustable Generation

Experiment with:

- Temperature
- Top-K
- Top-P
- Maximum New Tokens

### 🔢 Multiple Outputs

Generate multiple candidate captions for a single prompt and select the most suitable one.

### ⚡ GPU-Accelerated Deployment

The model is deployed on Hugging Face Spaces with GPU-accelerated inference.

---

## ⚠️ Limitations

As a generative language model, the system may occasionally produce:

- Grammatically incorrect captions
- Incomplete sentences
- Low-quality or nonsensical generations
- Content requiring manual review

Generated captions should therefore be reviewed before being published or used publicly.

The model is intended for **creative text generation**, not factual information retrieval.

---

## 🔮 Future Improvements

Potential future improvements include:

- Increasing dataset size and diversity
- Improving dataset quality
- Better removal of noisy captions
- Automated caption quality scoring
- Duplicate and similarity filtering
- Better semantic control
- Fine-tuning larger language models
- Improved safety filtering


---

## 📌 Project Resources

| Resource | Link |
|---|---|
| 🤖 **Fine-Tuned Model** | [Hugging Face Model](https://huggingface.co/nithin521/Meme_Caption_Generator) |
| 🚀 **Live Demo** | [Hugging Face Space](https://huggingface.co/spaces/nithin521/Meme-caption-generation) |

---

## 👨‍💻 Author

**Nithin Kumar**

[Hugging Face Profile](https://huggingface.co/nithin521)

---

## ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.
