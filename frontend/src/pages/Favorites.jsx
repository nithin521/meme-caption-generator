import { useEffect, useState } from "react";
import { getFavorites } from "../api/client";
import MemeCard from "../components/MemeCard";
import Loader from "../components/Loader";

export default function Favorites() {
  const [captions, setCaptions] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    getFavorites()
      .then((res) => setCaptions(res.data))
      .finally(() => setBusy(false));
  }, []);

  const updateCaption = (updated) => {
    if (!updated.favoritedByCurrentUser) {
      setCaptions((prev) => prev.filter((c) => c.id !== updated.id));
    } else {
      setCaptions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="font-display text-4xl stamp-text text-stamp mb-8">FAVORITES</h1>

      {busy && <Loader label="Loading favorites..." />}

      {!busy && captions.length === 0 && (
        <div className="card p-10 text-center text-muted">
          You haven't saved anything yet. Star a caption in the gallery to keep it here.
        </div>
      )}

      {!busy && captions.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {captions.map((c) => (
            <MemeCard key={c.id} caption={c} onChange={updateCaption} />
          ))}
        </div>
      )}
    </div>
  );
}
