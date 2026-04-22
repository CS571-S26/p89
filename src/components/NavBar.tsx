/**
 * NavBar - primary navigation bar rendered on every page.
 * Contains the app brand and links to main sections.
 */
import { NavLink } from 'react-router';

export default function NavBar() {
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
    </nav>
  );
}
