/**
 * SwipePage — the main interactive screen.
 * Renders a stack of SwipeCards. The user swipes right to keep/add and left
 * to discard/skip. Song data is stubbed until API integration is complete.
 */
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import SwipeCard from '../components/SwipeCard';
import type { Song, SwipeMode, SwipeDirection } from '../types';

type LocationState = {
  mode: SwipeMode;
  playlistId: string;
};

/** Stub songs used until real API data is available. */
const STUB_SONGS: Song[] = [
  { id: '1', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: 200 },
  { id: '2', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: 203 },
  { id: '3', title: 'Peaches', artist: 'Justin Bieber', album: 'Justice', duration: 198 },
  { id: '4', title: 'Stay', artist: 'The Kid LAROI', album: 'F*ck Love 3', duration: 141 },
  { id: '5', title: 'good 4 u', artist: 'Olivia Rodrigo', album: 'SOUR', duration: 178 },
];

export default function SwipePage() {
  const { state } = useLocation() as { state: LocationState };
  const navigate = useNavigate();
  const mode = state?.mode ?? 'remove';

  const [queue, setQueue] = useState<Song[]>(STUB_SONGS);
  const [kept, setKept] = useState<Song[]>([]);
  const [discarded, setDiscarded] = useState<Song[]>([]);

  /** The topmost visible card is the last element in the queue array. */
  const currentSong = queue[queue.length - 1];

  function handleSwipe(direction: SwipeDirection) {
    if (!currentSong) return;
    if (direction === 'keep') {
      setKept((prev) => [...prev, currentSong]);
    } else {
      setDiscarded((prev) => [...prev, currentSong]);
    }
    setQueue((prev) => prev.slice(0, -1));
  }

  const actionLabel = mode === 'add' ? 'Added' : 'Kept';

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
            onRestart={() => navigate('/playlists')}
          />
        )}
      </AnimatePresence>

      <div className="flex gap-8 text-sm text-gray-400">
        <span>Left: skip</span>
        <span>Right: {mode === 'add' ? 'add' : 'keep'}</span>
      </div>
    </div>
  );
}

type DoneStateProps = {
  actionLabel: string;
  keptCount: number;
  discardedCount: number;
  onRestart: () => void;
};

function DoneState({ actionLabel, keptCount, discardedCount, onRestart }: DoneStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-2xl font-semibold">All done</h2>
      <p className="text-gray-500 text-sm">
        {actionLabel} {keptCount} &middot; Skipped {discardedCount}
      </p>
      <button
        className="mt-4 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        onClick={onRestart}
      >
        Back to playlists
      </button>
    </div>
  );
}
