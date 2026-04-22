/**
 * PlaylistPage - displays the user's playlists and lets them pick one.
 * Also allows creating a new playlist, which navigates directly to the swipe
 * screen for it. In demo mode, all data is stubbed without API calls.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import type { Playlist } from '../types';
import { fetchLibraryPlaylists, createPlaylist } from '../services/musicKit';
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

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (showForm) inputRef.current?.focus();
  }, [showForm]);

  function selectPlaylist(playlist: Playlist) {
    navigate('/swipe', { state: { playlistId: playlist.id, demo } });
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;

    if (demo) {
      navigate('/swipe', { state: { playlistId: 'demo-new', demo: true } });
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const playlist = await createPlaylist(name);
      navigate('/swipe', { state: { playlistId: playlist.id, demo: false } });
    } catch {
      setCreateError('Failed to create playlist. Please try again.');
      setCreating(false);
    }
  }

  function handleCancelForm() {
    setShowForm(false);
    setNewName('');
    setCreateError(null);
  }

  return (
    <div className="flex flex-col items-center px-4 py-12 gap-8">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Your Playlists</h2>
        <p className="text-gray-500 text-sm mt-1">
          Choose a playlist to add songs
        </p>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading playlists...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && playlists.length === 0 && (
        <p className="text-gray-400 text-sm">
          No playlists found in your library.
        </p>
      )}

      <div className="w-full max-w-sm flex flex-col gap-3">
        {showForm ? (
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-2 px-4 py-4 border border-black rounded-2xl"
          >
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Playlist name"
              className="text-sm outline-none bg-transparent placeholder-gray-400"
              disabled={creating}
            />
            {createError && (
              <p className="text-red-500 text-xs">{createError}</p>
            )}
            <div className="flex gap-3 mt-1">
              <button
                type="submit"
                className="text-sm font-medium disabled:opacity-50"
                disabled={creating || !newName.trim()}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                className="text-sm text-gray-400 hover:text-black transition-colors"
                onClick={handleCancelForm}
                disabled={creating}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            className="w-full flex items-center gap-3 px-4 py-4 border border-dashed border-gray-300 rounded-2xl hover:border-black text-gray-500 hover:text-black transition-colors"
            onClick={() => setShowForm(true)}
          >
            <span className="text-lg leading-none">+</span>
            <span className="text-sm font-medium">New playlist</span>
          </button>
        )}

        {playlists.map(playlist => (
          <button
            key={playlist.id}
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
        ))}
      </div>
    </div>
  );
}
