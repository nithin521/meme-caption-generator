export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-3 text-muted font-mono text-sm py-8 justify-center">
      <span className="inline-block h-4 w-4 rounded-full border-2 border-stamp border-t-transparent animate-spin" />
      {label}
    </div>
  );
}
