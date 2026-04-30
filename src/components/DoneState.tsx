/**
 * DoneState - shown after a swipe session is complete.
 * Displays a summary of added and skipped songs, save status, and a
 * button to return to the previous context (home in demo mode, playlists otherwise).
 */
import type { Song } from '../types';
import PageHeader from './PageHeader';
import SongRow from './SongRow';
import StatusMessage from './StatusMessage';

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
        <PageHeader
          title="All done"
          subtitle={`Added ${kept.length} · Skipped ${discarded.length}`}
          centered
        />
        {saving && <StatusMessage className="mt-1">Saving changes...</StatusMessage>}
        {saveError && (
          <StatusMessage tone="error" live="assertive" className="mt-1 max-w-xs">
            {saveError}
          </StatusMessage>
        )}
      </div>

      {kept.length > 0 && (
        <div className="w-full">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700">
            Added
          </h2>
          <div className="flex flex-col gap-3">
            {kept.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      {discarded.length > 0 && (
        <div className="w-full">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-700">
            Skipped
          </h2>
          <div className="flex flex-col gap-3 opacity-80">
            {discarded.map(song => (
              <SongRow key={song.id} song={song} />
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className="mt-2 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        onClick={onRestart}
        disabled={saving}
      >
        {demo ? 'Back to home' : 'Back to playlists'}
      </button>
    </div>
  );
}
