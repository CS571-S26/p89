/**
 * NavBar - primary navigation bar rendered on every page.
 * Contains the app brand, links to main sections, and a logout button
 * when the user is signed in to Apple Music.
 */
import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { isAuthorized, unauthorize } from '../services/musicKit';

export default function NavBar() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    isAuthorized().then(setAuthorized).catch(() => {});
  }, []);

  async function handleLogout() {
    await unauthorize();
    setAuthorized(false);
    navigate('/');
  }

  return (
    <nav className="w-full border-b border-gray-200 px-6 py-4 flex items-center gap-8">
      <NavLink to="/" className="text-lg font-bold tracking-tight">
        Audify
      </NavLink>
      <div className="flex gap-6">
        <NavLink
          to="/playlists"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-500 hover:text-black'}`
          }
        >
          Playlists
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `text-sm font-medium transition-colors ${isActive ? 'text-black' : 'text-gray-500 hover:text-black'}`
          }
        >
          About
        </NavLink>
      </div>
      {authorized && (
        <button
          className="ml-auto text-sm text-gray-500 hover:text-black transition-colors"
          onClick={handleLogout}
        >
          Sign out
        </button>
      )}
    </nav>
  );
}
