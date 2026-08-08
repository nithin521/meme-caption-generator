import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navLink = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? "text-ink bg-stamp" : "text-offwhite/80 hover:text-stamp"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-ink/80 border-b border-white/10">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl tracking-wide stamp-text text-stamp">
            CAPTIONER
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={navLink}>Home</NavLink>
          <NavLink to="/generate" className={navLink}>Generate</NavLink>
          <NavLink to="/gallery" className={navLink}>Gallery</NavLink>
          {user && <NavLink to="/favorites" className={navLink}>Favorites</NavLink>}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted font-mono">@{user.username}</span>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="btn-secondary !px-3 !py-1.5 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-3 !py-1.5 text-sm">Log in</Link>
              <Link to="/register" className="btn-primary !px-3 !py-1.5 text-sm">Sign up</Link>
            </>
          )}
        </div>
      </nav>
      <div className="md:hidden flex justify-around border-t border-white/5 px-2 py-1">
        <NavLink to="/" end className={navLink}>Home</NavLink>
        <NavLink to="/generate" className={navLink}>Generate</NavLink>
        <NavLink to="/gallery" className={navLink}>Gallery</NavLink>
        {user && <NavLink to="/favorites" className={navLink}>Favorites</NavLink>}
      </div>
    </header>
  );
}
