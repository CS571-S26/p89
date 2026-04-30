/**
 * SwipeCard - a draggable card that resolves to an add or skip action.
 *
 * Drag right past SWIPE_THRESHOLD (or flick faster than VELOCITY_THRESHOLD)
 * to add the song; left to skip it. Colored overlays provide directional
 * feedback during the drag. On commit the card tosses a short distance in the
 * swipe direction while fading out, disappearing before reaching the viewport
 * edge. On a sub-threshold release it springs back to center.
 *
 * When a previewUrl is present the card auto-plays the clip and renders a
 * mini player (scrub bar, play/pause, elapsed/total time) in the info panel.
 * Pointer events on the player are stopped so they don't trigger the card drag.
 */
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  type PanInfo,
} from 'framer-motion';
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

/** Formats a duration in seconds as M:SS. */
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SwipeCard({ song, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.pause();
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }

  function handleScrub(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const time = Number(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }

  /** Rotation tracks x so the card tilts as it's dragged. */
  const rotate = useTransform(x, [-300, 300], [-20, 20]);

  const addOverlayOpacity = useTransform(
    x,
    [0, SWIPE_THRESHOLD],
    [0, MAX_OVERLAY_OPACITY]
  );
  const skipOverlayOpacity = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0],
    [MAX_OVERLAY_OPACITY, 0]
  );
  const addSymbolOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const skipSymbolOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  /**
   * Tosses the card a short distance in the swipe direction while fading it
   * out, so it disappears before reaching the viewport edge.
   */
  function exitCard(direction: SwipeDirection) {
    const sign = direction === 'add' ? 1 : -1;
    const targetX = x.get() + sign * EXIT_TRAVEL;
    animate(opacity, 0, { duration: 0.2, ease: 'easeOut' }).then(() =>
      onSwipe(direction)
    );
    animate(x, targetX, { duration: 0.2, ease: 'easeOut' });
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    const currentX = x.get();
    const vx = info.velocity.x;
    const pastThreshold = Math.abs(currentX) > SWIPE_THRESHOLD;
    const fastFlick = Math.abs(vx) > VELOCITY_THRESHOLD;

    if (pastThreshold || fastFlick) {
      const direction: SwipeDirection = fastFlick
        ? vx > 0
          ? 'add'
          : 'skip'
        : currentX > 0
          ? 'add'
          : 'skip';
      exitCard(direction);
    } else {
      animate(x, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        velocity: vx,
      });
      animate(y, 0, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
        velocity: info.velocity.y,
      });
    }
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      className="relative flex items-center justify-center w-80 h-[30rem] select-none"
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
          {song.previewUrl && (
            <audio ref={audioRef} src={song.previewUrl} loop />
          )}

          {song.artworkUrl ? (
            <img
              src={song.artworkUrl}
              alt={`${song.album} cover art`}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-gray-300"
                fill="currentColor"
              >
                <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6Z" />
              </svg>
            </div>
          )}

          {/* Add overlay */}
          <motion.div
            className="absolute inset-0 bg-green-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: addOverlayOpacity }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-20 h-20 text-white drop-shadow"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: addSymbolOpacity }}
            >
              <path d="M5 13l4 4L19 7" />
            </motion.svg>
          </motion.div>

          {/* Skip overlay */}
          <motion.div
            className="absolute inset-0 bg-red-500 flex items-center justify-center pointer-events-none"
            style={{ opacity: skipOverlayOpacity }}
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-20 h-20 text-white drop-shadow"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: skipSymbolOpacity }}
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </motion.svg>
          </motion.div>
        </div>

        {/* Song info + player */}
        <div className="px-5 pt-4 pb-4 flex flex-col gap-3 bg-white">
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-gray-900 truncate">
              {song.title}
            </span>
            <span className="text-sm text-gray-700 truncate">
              {song.artist}
            </span>
            <span className="text-xs text-gray-600 truncate">{song.album}</span>
          </div>

          {song.previewUrl && (
            /* Stop pointer events from reaching the drag handler */
            <div
              className="flex flex-col gap-2"
              onPointerDown={e => e.stopPropagation()}
            >
              {/* Scrub bar */}
              <div className="relative h-1 rounded-full bg-gray-200">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-black"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.1}
                  value={currentTime}
                  onChange={handleScrub}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Seek"
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <button
                  onClick={togglePlay}
                  aria-label={playing ? 'Pause' : 'Play'}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white"
                >
                  {playing ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                      fill="currentColor"
                    >
                      <path d="M8 5.14v14l11-7-11-7z" />
                    </svg>
                  )}
                </button>

                <span className="text-xs tabular-nums text-gray-700">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
