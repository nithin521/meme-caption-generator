export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted">
        <span className="font-mono">Captioner — fine-tuned GPT-2 meme caption generator</span>
        <span className="font-mono">Built with React · Spring Boot · MySQL</span>
      </div>
    </footer>
  );
}
