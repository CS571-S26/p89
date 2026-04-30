/**
 * NavBar - primary navigation bar rendered on every page.
 * Contains the app brand, links to main sections, and a logout button
 * when the user is signed in to the active music provider.
 */
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import {
  getCurrentProvider,
  isAuthorized,
  unauthorizeCurrentProvider,
} from '../services/musicService';

export default function NavBar() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const provider = getCurrentProvider();
  const providerName = provider === 'youtube' ? 'YouTube Music' : 'Apple Music';

  useEffect(() => {
    isAuthorized(provider).then(setAuthorized).catch(() => {});
  }, [provider]);

  async function handleLogout() {
    await unauthorizeCurrentProvider();
    setAuthorized(false);
    navigate('/');
  }

  return (
    <nav
      aria-label="Primary"
      className="w-full border-b border-gray-200 px-6 py-4 flex items-center gap-8"
    >
      <NavLink to="/" className="text-lg font-bold tracking-tight">
        Audify
      </NavLink>
      <div className="flex gap-6">
        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-700 hover:text-black'}`
          }
        >
          Playlists
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-700 hover:text-black'}`
          }
        >
          About
        </NavLink>
      </div>
      {authorized && (
        <span className="ml-auto text-xs font-medium uppercase tracking-[0.18em] text-gray-700">
          {providerName}
        </span>
      )}
      {authorized && (
        <button
          type="button"
          className="text-sm text-gray-700 hover:text-black transition-colors"
          onClick={handleLogout}
        >
          Sign out
        </button>
      )}
    </nav>
  );
}
