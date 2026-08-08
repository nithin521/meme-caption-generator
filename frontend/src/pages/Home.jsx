import { Link } from "react-router-dom";

const steps = [
  { label: "Prompt", text: "Type a phrase, or upload a meme and let OCR pull the text for you." },
  { label: "Tune", text: "Dial in temperature, top-k, top-p, length, and how many variants to roll." },
  { label: "Ship", text: "Generate 1–30 captions at once, then save your favorites to the gallery." },
];

export default function Home() {
  return (
    <div>
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="font-display text-5xl sm:text-6xl leading-[0.95] stamp-text text-stamp mb-6">
            CAPTIONS,
            <br />
            FINE-TUNED.
          </h1>
          <p className="text-offwhite/80 text-lg mb-8 max-w-md">
            A GPT-2 model fine-tuned on thousands of meme captions. Type a prompt or upload
            an image, tune the model's knobs yourself, and generate up to 30 captions in one go.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/generate" className="btn-primary">Start generating</Link>
            <Link to="/gallery" className="btn-secondary">Browse gallery</Link>
          </div>
        </div>

        <div className="card p-6 shadow-stamp">
          <p className="label">sample output</p>
          <p className="font-display text-2xl text-offwhite leading-tight mb-3">
            "me explaining to my code why it worked yesterday"
          </p>
          <div className="flex items-center justify-between text-xs font-mono text-muted border-t border-white/10 pt-3">
            <span>temperature 0.8 · top_p 0.9</span>
            <span className="text-pop">♥ 214</span>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={s.label} className="card p-5">
              <span className="font-mono text-xs text-stamp">0{i + 1}</span>
              <h3 className="font-display text-xl mt-2 mb-2 tracking-wide">{s.label.toUpperCase()}</h3>
              <p className="text-sm text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
