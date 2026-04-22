/**
 * SwipePage - the main interactive screen.
 *
 * Fetches personalized song suggestions from Apple Music and presents them as
 * swipeable cards. Swipe right to add a song to the playlist, left to skip it.
 * Kept songs are added to the playlist when the session ends.
 *
 * The header shows how many songs remain and provides a "Done" button to commit
 * early, and a "Cancel" button to exit without saving.
 */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/SwipeCard';
import DoneState from '../components/DoneState';
import type { Song, SwipeDirection } from '../types';
import {
  fetchSongSuggestions,
  addTracksToPlaylist,
} from '../services/musicKit';
import { STUB_SONGS_BY_PLAYLIST } from '../services/stubs';

type LocationState = {
  playlistId: string;
  demo?: boolean;
};

export default function SwipePage() {
  const { state } = useLocation() as { state: LocationState | null };
  const navigate = useNavigate();
  const playlistId = state?.playlistId ?? '';
  const demo = state?.demo ?? false;

  const [queue, setQueue] = useState<Song[]>([]);
  const [kept, setKept] = useState<Song[]>([]);
  const [discarded, setDiscarded] = useState<Song[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  /** Guards against double-save in React StrictMode. */
  const saveTriggered = useRef(false);

  useEffect(() => {
    if (demo) {
      const songs = STUB_SONGS_BY_PLAYLIST[playlistId] ?? [];
      setQueue([...songs].reverse());
      return;
    }
    if (!playlistId) return;

    fetchSongSuggestions()
      .then(songs => setQueue([...songs].reverse()))
      .catch(() => setError('Failed to load suggestions.'))
      .finally(() => setLoading(false));
  }, [playlistId, demo]);

  /**
   * Once the queue is empty, add kept songs to the playlist.
   * Skipped in demo mode. Triggered by exhausting the queue or pressing Done.
   */
  useEffect(() => {
    if (loading || error || queue.length > 0 || saveTriggered.current) return;
    saveTriggered.current = true;

    if (demo || kept.length === 0) return;

    setSaving(true);
    addTracksToPlaylist(playlistId, kept)
      .catch(() =>
        setSaveError(
          'Could not add songs to Apple Music. Changes were not saved.'
        )
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

  function handleSwipe(direction: SwipeDirection) {
    if (!currentSong) return;
    if (direction === 'add') {
      setKept(prev => [...prev, currentSong]);
    } else {
      setDiscarded(prev => [...prev, currentSong]);
    }
    setQueue(prev => prev.slice(0, -1));
  }

  /** Commits current selections and triggers the save flow. */
  function handleDone() {
    setQueue([]);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-8 px-4">
      <div className="flex items-center justify-between w-full max-w-sm">
        {currentSong ? (
          <button
            className="text-sm text-gray-500 hover:text-black transition-colors"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        ) : (
          <span />
        )}
        {currentSong && (
          <span className="text-sm text-gray-400">{queue.length} left</span>
        )}
        {currentSong ? (
          <button
            className="text-sm font-medium hover:text-gray-600 transition-colors"
            onClick={handleDone}
          >
            Done
          </button>
        ) : (
          <span />
        )}
      </div>

      <AnimatePresence>
        {currentSong ? (
          <SwipeCard
            key={currentSong.id}
            song={currentSong}
            onSwipe={handleSwipe}
          />
        ) : (
          <DoneState
            kept={kept}
            discarded={discarded}
            saving={saving}
            saveError={saveError}
            demo={demo}
            onRestart={() => demo ? navigate('/') : navigate('/playlists')}
          />
        )}
      </AnimatePresence>

      {currentSong && (
        <div className="flex gap-8 text-sm text-gray-400">
          <span>Left: skip</span>
          <span>Right: add</span>
        </div>
      )}
    </div>
  );
}

