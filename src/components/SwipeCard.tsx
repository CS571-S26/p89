/**
 * SwipeCard — a draggable card that resolves to a keep or discard action.
 *
 * Drag right past SWIPE_THRESHOLD (or flick faster than VELOCITY_THRESHOLD)
 * to keep; left to discard. Colored overlays provide directional feedback
 * during the drag. On commit the card tosses a short distance in the swipe
 * direction while fading out, disappearing before reaching the viewport edge.
 * On a sub-threshold release it springs back to center.
 */
import { motion, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion';
import type { Song, SwipeDirection } from '../types';

/** Horizontal pixel distance from center required to commit a slow drag. */
const SWIPE_THRESHOLD = 100;

/** Horizontal velocity (px/s) that commits a fast flick regardless of position. */
const VELOCITY_THRESHOLD = 500;

/** Maximum opacity of the colored overlay at full swipe distance. */
const MAX_OVERLAY_OPACITY = 0.55;

/**
 * How far (px) the card travels toward the edge before it fully fades out.
 * Kept short so the card vanishes well before reaching the screen edge.
 */
const EXIT_TRAVEL = 160;

type SwipeCardProps = {
  song: Song;
  onSwipe: (direction: SwipeDirection) => void;
};

export default function SwipeCard({ song, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);

  /** Rotation tracks x so the card tilts as it's dragged. */
  const rotate = useTransform(x, [-300, 300], [-20, 20]);

  const keepOverlayOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, MAX_OVERLAY_OPACITY]);
  const discardOverlayOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [MAX_OVERLAY_OPACITY, 0]);
  const keepSymbolOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const discardSymbolOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  /**
   * Tosses the card a short distance in the swipe direction while fading it
   * out, so it disappears before reaching the viewport edge.
   */
  function exitCard(direction: SwipeDirection) {
    const sign = direction === 'keep' ? 1 : -1;
    const targetX = x.get() + sign * EXIT_TRAVEL;
    animate(opacity, 0, { duration: 0.2, ease: 'easeOut' }).then(() => onSwipe(direction));
    animate(x, targetX, { duration: 0.2, ease: 'easeOut' });
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentX = x.get();
    const vx = info.velocity.x;
    const pastThreshold = Math.abs(currentX) > SWIPE_THRESHOLD;
    const fastFlick = Math.abs(vx) > VELOCITY_THRESHOLD;

    if (pastThreshold || fastFlick) {
      const direction: SwipeDirection =
        fastFlick ? (vx > 0 ? 'keep' : 'discard') : (currentX > 0 ? 'keep' : 'discard');
      exitCard(direction);
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 30, velocity: vx });
      animate(y, 0, { type: 'spring', stiffness: 300, damping: 30, velocity: info.velocity.y });
    }
  }

  return (
    <motion.div
      className="relative flex items-center justify-center w-80 h-[28rem] select-none"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <motion.div
        className="absolute inset-0 rounded-3xl shadow-xl flex flex-col overflow-hidden cursor-grab active:cursor-grabbing"
        style={{ x, y, rotate, opacity }}
        drag="x"
        dragMomentum={false}
        dragElastic={0.15}
        onDragEnd={handleDragEnd}
      >
        {/* Artwork */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center relative">
          {song.artworkUrl ? (
            <img
              src={song.artworkUrl}
              alt={`${song.album} artwork`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-gray-300" fill="currentColor">
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z" />
              </svg>
            </div>
          )}

          {/* Keep overlay */}
          <motion.div
            className="absolute inset-0 bg-green-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: keepOverlayOpacity }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-20 h-20 text-white drop-shadow"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: keepSymbolOpacity }}
            >
              <path d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>

          {/* Discard overlay */}
          <motion.div
            className="absolute inset-0 bg-red-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: discardOverlayOpacity }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-20 h-20 text-white drop-shadow"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: discardSymbolOpacity }}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          </motion.div>
        </div>

        {/* Song info */}
        <div className="px-5 py-4 flex flex-col gap-0.5 bg-white">
          <span className="font-semibold text-gray-900 truncate">{song.title}</span>
          <span className="text-sm text-gray-500 truncate">{song.artist}</span>
          <span className="text-xs text-gray-400 truncate">{song.album}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
