/**
 * PlaylistPage - displays playlists for the user to pick from.
 * In demo mode, renders stub playlists without an API call.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Playlist } from '../types';
import { fetchLibraryPlaylists } from '../services/musicKit';
import { STUB_PLAYLISTS } from '../services/stubs';

type LocationState = {
  demo?: boolean;
};

export default function PlaylistPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const demo = state?.demo ?? false;

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demo) {
      setPlaylists(STUB_PLAYLISTS);
      return;
    }
    fetchLibraryPlaylists()
      .then(setPlaylists)
      .catch(() => setError('Failed to load playlists.'))
      .finally(() => setLoading(false));
  }, [demo]);

  function selectPlaylist(playlist: Playlist) {
    navigate('/mode', { state: { playlistId: playlist.id, demo } });
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 gap-8">
      <h2 className="text-2xl font-semibold">Your Playlists</h2>

      {loading && <p className="text-gray-400 text-sm">Loading playlists...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && playlists.length === 0 && (
        <p className="text-gray-400 text-sm">
          No playlists found in your library.
        </p>
      )}

      <ul className="w-full max-w-sm flex flex-col gap-3">
        {playlists.map(playlist => (
          <li key={playlist.id}>
            <button
              className="w-full flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl hover:border-black transition-colors"
              onClick={() => selectPlaylist(playlist)}
            >
              {playlist.artworkUrl && (
                <img
                  src={playlist.artworkUrl}
                  alt=""
                  className="w-10 h-10 rounded-lg object-cover shrink-0"
                />
              )}
              <span className="font-medium text-left truncate">
                {playlist.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
