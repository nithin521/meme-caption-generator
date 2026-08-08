import { useEffect, useState, useCallback } from "react";
import { getGallery } from "../api/client";
import MemeCard from "../components/MemeCard";
import Loader from "../components/Loader";

export default function Gallery() {
  const [captions, setCaptions] = useState([]);
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [busy, setBusy] = useState(true);

  const load = useCallback(async (p, s) => {
    setBusy(true);
    try {
      const res = await getGallery(p, 12, s);
      setCaptions(res.data.content);
      setTotalPages(res.data.totalPages || 1);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    load(page, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort]);

  const updateCaption = (updated) => {
    setCaptions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-display text-4xl stamp-text text-stamp">GALLERY</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setSort("recent"); setPage(0); }}
            className={sort === "recent" ? "btn-primary !px-3 !py-1.5 text-sm" : "btn-secondary !px-3 !py-1.5 text-sm"}
          >
            Recent
          </button>
          <button
            onClick={() => { setSort("top"); setPage(0); }}
            className={sort === "top" ? "btn-primary !px-3 !py-1.5 text-sm" : "btn-secondary !px-3 !py-1.5 text-sm"}
          >
            Top liked
          </button>
        </div>
      </div>

      {busy && <Loader label="Loading gallery..." />}

      {!busy && captions.length === 0 && (
        <div className="card p-10 text-center text-muted">No captions yet — be the first to generate one.</div>
      )}

      {!busy && captions.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {captions.map((c) => (
              <MemeCard key={c.id} caption={c} onChange={updateCaption} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              className="btn-secondary !px-3 !py-1.5 text-sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <span className="text-sm text-muted font-mono">Page {page + 1} of {totalPages}</span>
            <button
              className="btn-secondary !px-3 !py-1.5 text-sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
