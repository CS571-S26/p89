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
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusMessage from '../components/StatusMessage';

type LocationState = {
  demo?: boolean;
};

export default function PlaylistPage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState | null };
  const demo = state?.demo ?? false;

  const [remotePlaylists, setRemotePlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (demo) return;

    fetchLibraryPlaylists()
      .then(setRemotePlaylists)
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

  const playlists = demo ? STUB_PLAYLISTS : remotePlaylists;

  return (
    <div className="flex flex-col items-center px-4 py-12 gap-8">
      <PageHeader
        title="Your Playlists"
        subtitle="Choose a playlist to add songs."
        centered
      />

      {loading && <StatusMessage>Loading playlists...</StatusMessage>}
      {error && (
        <StatusMessage tone="error" live="assertive">
          {error}
        </StatusMessage>
      )}

      {!loading && !error && playlists.length === 0 && (
        <StatusMessage>
          No playlists found in your library.
        </StatusMessage>
      )}

      <div className="w-full max-w-sm flex flex-col gap-3">
        {showForm ? (
          <SectionCard className="border-black">
            <form onSubmit={handleCreate} className="flex flex-col gap-2">
              <label
                htmlFor="playlist-name"
                className="text-sm font-medium text-gray-900"
              >
                Playlist name
              </label>
              <input
                id="playlist-name"
                ref={inputRef}
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Road trip favorites"
                className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-500 focus:border-gray-950"
                disabled={creating}
              />
              {createError && (
                <StatusMessage tone="error" live="assertive" className="text-xs">
                  {createError}
                </StatusMessage>
              )}
              <div className="flex gap-3 mt-1">
                <button
                  type="submit"
                  className="rounded-full bg-gray-950 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                  disabled={creating || !newName.trim()}
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
                  onClick={handleCancelForm}
                  disabled={creating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </SectionCard>
        ) : !demo ? (
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-4 border border-dashed border-gray-300 rounded-2xl hover:border-black text-gray-700 hover:text-black transition-colors"
            onClick={() => setShowForm(true)}
          >
            <span className="text-lg leading-none">+</span>
            <span className="text-sm font-medium">New playlist</span>
          </button>
        ) : null}

        {playlists.map(playlist => (
          <button
            type="button"
            key={playlist.id}
            className="w-full flex items-center gap-3 px-4 py-4 border border-gray-200 rounded-2xl hover:border-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
            onClick={() => selectPlaylist(playlist)}
          >
            {playlist.artworkUrl && (
              <img
                src={playlist.artworkUrl}
                alt={`${playlist.name} cover art`}
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
