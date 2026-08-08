import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { likeCaption, favoriteCaption, unfavoriteCaption } from "../api/client";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function MemeCard({ caption, onChange }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLike = async () => {
    if (!user || busy || !caption.id) return;
    setBusy(true);
    try {
      const res = await likeCaption(caption.id);
      onChange?.(res.data);
    } finally {
      setBusy(false);
    }
  };

  const handleFavorite = async () => {
    if (!user || busy || !caption.id) return;
    setBusy(true);
    try {
      if (caption.favoritedByCurrentUser) {
        await unfavoriteCaption(caption.id);
        onChange?.({ ...caption, favoritedByCurrentUser: false });
      } else {
        await favoriteCaption(caption.id);
        onChange?.({ ...caption, favoritedByCurrentUser: true });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-4 flex flex-col gap-3 hover:border-stamp/40 transition-colors">
      {caption.imageUrl && (
        <img
          src={caption.imageUrl.startsWith("http") ? caption.imageUrl : `${API_BASE}${caption.imageUrl}`}
          alt="meme source"
          className="rounded-lg w-full h-40 object-cover border border-white/10"
        />
      )}

      <p className="text-offwhite text-base leading-snug">{caption.text}</p>

      <div className="flex items-center justify-between text-xs text-muted font-mono mt-auto pt-2 border-t border-white/5">
        <span>@{caption.createdByUsername}</span>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={!user || busy || !caption.id}
            className={`flex items-center gap-1 transition-colors disabled:opacity-40 ${
              caption.likedByCurrentUser ? "text-pop" : "hover:text-pop"
            }`}
            title={user ? "Like" : "Log in to like"}
          >
            {caption.likedByCurrentUser ? "♥" : "♡"} {caption.likeCount}
          </button>

          <button
            onClick={handleFavorite}
            disabled={!user || busy || !caption.id}
            className={`transition-colors disabled:opacity-40 ${
              caption.favoritedByCurrentUser ? "text-stamp" : "hover:text-stamp"
            }`}
            title={user ? "Save to favorites" : "Log in to save"}
          >
            {caption.favoritedByCurrentUser ? "★" : "☆"}
          </button>
        </div>
      </div>
    </div>
  );
}
