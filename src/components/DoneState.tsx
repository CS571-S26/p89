/**
 * DoneState - shown after a swipe session is complete.
 * Displays a summary of added and skipped songs, save status, and a
 * button to return to the previous context (home in demo mode, playlists otherwise).
 */
import type { Song } from '../types';
import SongRow from './SongRow';

type DoneStateProps = {
  kept: Song[];
  discarded: Song[];
  saving: boolean;
  saveError: string | null;
  demo: boolean;
  onRestart: () => void;
};

export default function DoneState({
  kept,
  discarded,
  saving,
  saveError,
  demo,
  onRestart,
}: DoneStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-center">
        <h2 className="text-2xl font-semibold">All done</h2>
        <p className="text-gray-500 text-sm mt-1">
          Added {kept.length} &middot; Skipped {discarded.length}
        </p>
        {saving && (
          <p className="text-gray-400 text-sm mt-1">Saving changes...</p>
        )}
        {saveError && (
          <p className="text-red-500 text-sm mt-1 max-w-xs">{saveError}</p>
        )}
      </div>

      {kept.length > 0 && (
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Added
          </p>
          <div className="flex flex-col gap-3">
            {kept.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {discarded.length > 0 && (
        <div className="w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Skipped
          </p>
          <div className="flex flex-col gap-3 opacity-50">
            {discarded.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      <button
        className="mt-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        onClick={onRestart}
        disabled={saving}
      >
        {demo ? 'Back to home' : 'Back to playlists'}
      </button>
    </div>
  );
}
