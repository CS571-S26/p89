/**
 * SwipePage — the main interactive screen.
 *
 * Fetches tracks for the selected playlist and renders a stack of SwipeCards.
 * Swipe right to keep a song, left to discard it.
 *
 * In remove mode, discarded songs are deleted from the playlist when the queue
 * is exhausted.
 */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/SwipeCard';
import type { Song, SwipeMode, SwipeDirection } from '../types';
import { fetchPlaylistTracks, removeTracksFromPlaylist } from '../services/musicKit';

type LocationState = {
  mode: SwipeMode;
  playlistId: string;
};

export default function SwipePage() {
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();
  const mode = state?.mode ?? 'remove';
  const playlistId = state?.playlistId ?? '';

  const [queue, setQueue] = useState<Song[]>([]);
  const [kept, setKept] = useState<Song[]>([]);
  const [discarded, setDiscarded] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /** Guards against double-save in React StrictMode. */
  const saveTriggered = useRef(false);

  useEffect(() => {
    if (!playlistId) return;
    fetchPlaylistTracks(playlistId)
      .then((songs) => {
        // Reverse so queue[last] is the first song shown.
        setQueue([...songs].reverse());
      })
      .catch(() => setError('Failed to load tracks.'))
      .finally(() => setLoading(false));
  }, [playlistId]);

  /**
   * Once all cards are swiped, apply changes to the playlist.
   * Remove mode: delete discarded songs from the playlist.
   */
  useEffect(() => {
    if (loading || error || queue.length > 0 || saveTriggered.current) return;
    saveTriggered.current = true;

    if (mode !== 'remove' || discarded.length === 0) return;

    setSaving(true);
    removeTracksFromPlaylist(playlistId, discarded)
      .catch(() =>
        setSaveError('Could not remove songs from Apple Music. Changes were not saved.')
      )
      .finally(() => setSaving(false));
  }, [queue.length, loading, error]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!playlistId) {
    return <Navigate to="/playlists" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <p className="text-gray-400 text-sm">Loading tracks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-4">
        <p className="text-red-500 text-sm">{error}</p>
        <button className="text-sm underline" onClick={() => navigate(-1)}>
          Go back
        </button>
      </div>
    );
  }

  const currentSong = queue[queue.length - 1];
  const actionLabel = mode === 'add' ? 'Added' : 'Kept';

  function handleSwipe(direction: SwipeDirection) {
    if (!currentSong) return;
    if (direction === 'keep') {
      setKept((prev) => [...prev, currentSong]);
    } else {
      setDiscarded((prev) => [...prev, currentSong]);
    }
    setQueue((prev) => prev.slice(0, -1));
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 px-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        <button
          className="text-sm text-gray-500 hover:text-black transition-colors"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <span className="text-sm text-gray-400 capitalize">{mode} mode</span>
      </div>

      <AnimatePresence>
        {currentSong ? (
          <SwipeCard key={currentSong.id} song={currentSong} onSwipe={handleSwipe} />
        ) : (
          <DoneState
            actionLabel={actionLabel}
            keptCount={kept.length}
            discardedCount={discarded.length}
            saving={saving}
            saveError={saveError}
            onRestart={() => navigate('/playlists')}
          />
        )}
      </AnimatePresence>

      {currentSong && (
        <div className="flex gap-8 text-sm text-gray-400">
          <span>Left: skip</span>
          <span>Right: {mode === 'add' ? 'add' : 'keep'}</span>
        </div>
      )}
    </div>
  );
}

type DoneStateProps = {
  actionLabel: string;
  keptCount: number;
  discardedCount: number;
  saving: boolean;
  saveError: string | null;
  onRestart: () => void;
};

function DoneState({
  actionLabel,
  keptCount,
  discardedCount,
  saving,
  saveError,
  onRestart,
}: DoneStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">All done</h2>
      <p className="text-gray-500 text-sm">
        {actionLabel} {keptCount} &middot; Skipped {discardedCount}
      </p>
      {saving && <p className="text-gray-400 text-sm">Saving changes...</p>}
      {saveError && <p className="text-red-500 text-sm max-w-xs">{saveError}</p>}
      <button
        className="mt-4 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        onClick={onRestart}
        disabled={saving}
      >
        Back to playlists
      </button>
    </div>
  );
}
