/**
 * ModePage — lets the user choose between adding or removing songs.
 * The selected mode is passed as router state to the swipe screen.
 */
import { useNavigate, useLocation } from 'react-router';
import type { SwipeMode } from '../types';

type LocationState = {
  playlistId: string;
};

export default function ModePage() {
  const navigate = useNavigate();
  const { state } = useLocation() as { state: LocationState };

  function selectMode(mode: SwipeMode) {
    navigate('/swipe', { state: { mode, playlistId: state?.playlistId } });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h2 className="text-2xl font-semibold">What would you like to do?</h2>
      <div className="flex gap-4">
        <ModeCard
          label="Add songs"
          description="Swipe right to add a song to a playlist."
          onClick={() => selectMode('add')}
        />
        <ModeCard
          label="Remove songs"
          description="Swipe right to keep, left to remove."
          onClick={() => selectMode('remove')}
        />
      </div>
    </div>
  );
}

type ModeCardProps = {
  label: string;
  description: string;
  onClick: () => void;
};

function ModeCard({ label, description, onClick }: ModeCardProps) {
  return (
    <button
      className="flex flex-col items-start gap-2 p-6 border border-gray-200 rounded-2xl w-52 text-left hover:border-black transition-colors"
      onClick={onClick}
    >
      <span className="font-semibold text-lg">{label}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </button>
  );
}
