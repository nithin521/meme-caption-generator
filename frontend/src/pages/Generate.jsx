import { useState, useRef } from "react";
import { generateCaptions, ocrGenerate } from "../api/client";
import MemeCard from "../components/MemeCard";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";

const defaultParams = {
  prompt: "",
  n: 5,
  temperature: 0.75,
  topK: 40,
  topP: 0.9,
  maxNewTokens: 25,
  repetitionPenalty: 1.1,
  saveToGallery: true,
};

function Slider({ label, name, value, min, max, step, hint, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="label !mb-0">{label}</label>
        <span className="font-mono text-xs text-stamp">{value}</span>
      </div>
      <input
        type="range"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        className="w-full accent-[#FFD400] mt-1"
      />
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

export default function Generate() {
  const { user } = useAuth();
  const [params, setParams] = useState(defaultParams);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const update = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setParams((p) => ({ ...p, [key]: val }));
  };

  const updateNumber = (key) => (e) => setParams((p) => ({ ...p, [key]: Number(e.target.value) }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Log in to generate captions.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("n", params.n);
        formData.append("temperature", params.temperature);
        formData.append("topK", params.topK);
        formData.append("topP", params.topP);
        formData.append("maxNewTokens", params.maxNewTokens);
        res = await ocrGenerate(formData);
      } else {
        res = await generateCaptions(params);
      }
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Generation failed. Is the inference service running?");
    } finally {
      setBusy(false);
    }
  };

  const updateResult = (id, updated) => {
    setResults((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl stamp-text text-stamp mb-2">GENERATE</h1>
      <p className="text-muted mb-8">
        Control every knob the model exposes, or drop in a meme image and let OCR supply the prompt.
      </p>

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        {/* Controls */}
        <form onSubmit={handleGenerate} className="card p-5 flex flex-col gap-5 h-fit sticky top-20">
          <div>
            <label className="label">Prompt (optional)</label>
            <input
              className="input"
              placeholder='e.g. "POV: when bro"'
              value={params.prompt}
              onChange={update("prompt")}
              disabled={!!imageFile}
            />
          </div>

          <div>
            <label className="label">Or upload a meme image (OCR)</label>
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="rounded-md border border-white/10 w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-1 right-1 bg-ink/80 text-offwhite text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFile}
                className="text-xs text-muted file:mr-3 file:btn-secondary file:!px-3 file:!py-1.5 file:text-xs file:border-0"
              />
            )}
          </div>

          <Slider
            label="Number of captions"
            name="n"
            min={1}
            max={30}
            step={1}
            value={params.n}
            onChange={updateNumber("n")}
            hint="Between 1 and 30 per batch."
          />

          <Slider
            label="Temperature"
            name="temperature"
            min={0.1}
            max={2}
            step={0.05}
            value={params.temperature}
            onChange={updateNumber("temperature")}
            hint="Higher = weirder, more random."
          />

          <Slider
            label="Top-k"
            name="topK"
            min={0}
            max={200}
            step={5}
            value={params.topK}
            onChange={updateNumber("topK")}
            hint="Limits sampling to the top K likely tokens."
          />

          <Slider
            label="Top-p (nucleus)"
            name="topP"
            min={0}
            max={1}
            step={0.05}
            value={params.topP}
            onChange={updateNumber("topP")}
          />

          <Slider
            label="Max new tokens"
            name="maxNewTokens"
            min={5}
            max={80}
            step={1}
            value={params.maxNewTokens}
            onChange={updateNumber("maxNewTokens")}
            hint="Roughly controls caption length."
          />

          <Slider
            label="Repetition penalty"
            name="repetitionPenalty"
            min={1}
            max={2}
            step={0.05}
            value={params.repetitionPenalty}
            onChange={updateNumber("repetitionPenalty")}
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={params.saveToGallery} onChange={update("saveToGallery")} className="accent-[#FFD400]" />
            Save results to public gallery
          </label>

          {error && <p className="text-pop text-sm">{error}</p>}

          <button className="btn-primary" disabled={busy}>
            {busy ? "Generating..." : `Generate ${params.n} caption${params.n > 1 ? "s" : ""}`}
          </button>
          {!user && <p className="text-xs text-muted">You need an account to generate. <a href="/login" className="text-stamp hover:underline">Log in</a></p>}
        </form>

        {/* Results */}
        <div>
          {busy && <Loader label="Rolling captions..." />}
          {!busy && results.length === 0 && (
            <div className="card p-10 text-center text-muted">
              Your generated captions will show up here.
            </div>
          )}
          {!busy && results.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-4">
              {results.map((c, i) => (
                <MemeCard
                  key={c.id ?? i}
                  caption={c}
                  onChange={(updated) => c.id && updateResult(c.id, updated)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
