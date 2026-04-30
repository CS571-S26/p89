type SwipeControlsProps = {
  onSkip: () => void;
  onAdd: () => void;
};

export default function SwipeControls({
  onSkip,
  onAdd,
}: SwipeControlsProps) {
  return (
    <div className="flex w-full max-w-sm items-center gap-3">
      <button
        type="button"
        className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:border-gray-900 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
        onClick={onSkip}
      >
        Skip song
      </button>
      <button
        type="button"
        className="flex-1 rounded-full bg-gray-950 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
        onClick={onAdd}
      >
        Add song
      </button>
    </div>
  );
}
