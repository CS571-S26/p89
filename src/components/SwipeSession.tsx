import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import type { Song, SwipeDirection } from '../types';
import { addTracksToPlaylist } from '../services/musicKit';
import DoneState from './DoneState';
import StatusMessage from './StatusMessage';
import SwipeCard from './SwipeCard';
import SwipeControls from './SwipeControls';

type SwipeSessionProps = {
  songs: Song[];
  playlistId: string;
  demo: boolean;
};

export default function SwipeSession({
  songs,
  playlistId,
  demo,
}: SwipeSessionProps) {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<Song[]>(() => [...songs].reverse());
  const [kept, setKept] = useState<Song[]>([]);
  const [discarded, setDiscarded] = useState<Song[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTriggered = useRef(false);

  const currentSong = queue[queue.length - 1];

  function handleSwipe(direction: SwipeDirection) {
    if (!currentSong) return;

    const nextKept =
      direction === 'add' ? [...kept, currentSong] : kept;

    if (direction === 'add') {
      setKept(nextKept);
    } else {
      setDiscarded(prev => [...prev, currentSong]);
    }

    const nextQueue = queue.slice(0, -1);
    setQueue(nextQueue);

    if (nextQueue.length === 0) {
      void completeSession(nextKept);
    }
  }

  function handleDone() {
    setQueue([]);
    void completeSession(kept);
  }

  async function completeSession(keptSongs: Song[]) {
    if (saveTriggered.current) return;
    saveTriggered.current = true;

    if (demo || keptSongs.length === 0) return;

    setSaving(true);
    setSaveError(null);
    try {
      await addTracksToPlaylist(playlistId, keptSongs);
    } catch {
      setSaveError('Could not add songs to Apple Music. Changes were not saved.');
    } finally {
      setSaving(false);
    }
  }

  const handleArrowAction = useEffectEvent((direction: SwipeDirection) => {
    handleSwipe(direction);
  });

  useEffect(() => {
    if (!currentSong) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleArrowAction('skip');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleArrowAction('add');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSong]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] gap-6 px-4 py-8">
      <h1 className="sr-only">Swipe Songs</h1>
      <div className="flex items-center justify-between w-full max-w-sm">
        {currentSong ? (
          <button
            type="button"
            className="text-sm font-medium text-gray-700 transition-colors hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
        ) : (
          <span />
        )}
        {currentSong && (
          <StatusMessage className="text-center font-medium">
            {queue.length} left
          </StatusMessage>
        )}
        {currentSong ? (
          <button
            type="button"
            className="text-sm font-medium text-gray-800 transition-colors hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
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
            onRestart={() => (demo ? navigate('/') : navigate('/playlists'))}
          />
        )}
      </AnimatePresence>

      {currentSong && (
        <>
          <SwipeControls
            onSkip={() => handleSwipe('skip')}
            onAdd={() => handleSwipe('add')}
          />
          <StatusMessage className="text-center">
            Use the buttons or your keyboard. Press Left Arrow to skip and Right
            Arrow to add.
          </StatusMessage>
        </>
      )}
    </div>
  );
}
