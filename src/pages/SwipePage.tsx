/**
 * SwipePage - the main interactive screen.
 *
 * Fetches provider-specific song suggestions and presents them as swipeable
 * cards. Swipe right to add a song to the playlist, left to skip it. Kept
 * songs are added to the playlist when the session ends.
 *
 * The header shows how many songs remain and provides a "Done" button to commit
 * early, and a "Cancel" button to exit without saving.
 */
import { useState, useEffect, useRef } from 'react';
import { useLocation, Navigate } from 'react-router';
import type { Song } from '../types';
import {
  fetchSongSuggestions,
  getCurrentProvider,
} from '../services/musicService';
import { STUB_SONGS_BY_PLAYLIST } from '../services/stubs';
import StatusMessage from '../components/StatusMessage';
import SwipeSession from '../components/SwipeSession';

type LocationState = {
  playlistId: string;
  demo?: boolean;
};

export default function SwipePage() {
  const { state } = useLocation() as { state: LocationState | null };
  const playlistId = state?.playlistId ?? '';
  const demo = state?.demo ?? false;

  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState<string | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const fetchedForPlaylist = useRef<string | null>(null);
  const demoSongs = STUB_SONGS_BY_PLAYLIST[playlistId] ?? [];
  const provider = getCurrentProvider();

  useEffect(() => {
    if (!playlistId) return;
    if (demo) return;
    if (fetchedForPlaylist.current === playlistId) return;

    fetchedForPlaylist.current = playlistId;
    fetchSongSuggestions()
      .then(setSongs)
      .catch(() => setError('Failed to load suggestions.'))
      .finally(() => setLoading(false));
  }, [playlistId, demo]);

  if (!playlistId) {
    return <Navigate to="/playlists" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-57px)]">
        <StatusMessage>
          Loading {provider === 'youtube' ? 'YouTube' : 'Apple Music'} tracks...
        </StatusMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-4">
        <StatusMessage tone="error" live="assertive">
          {error}
        </StatusMessage>
      </div>
    );
  }

  return (
    <SwipeSession
      key={`${playlistId}-${demo ? 'demo' : 'live'}`}
      songs={demo ? demoSongs : songs}
      playlistId={playlistId}
      demo={demo}
    />
  );
}
