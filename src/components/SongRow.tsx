/**
 * SongRow - displays a single song with artwork thumbnail, title, and artist.
 * Used in list contexts such as the session summary on the done screen.
 */
import type { Song } from '../types';

type SongRowProps = {
  song: Song;
};

export default function SongRow({ song }: SongRowProps) {
  return (
    <div className="flex items-center gap-3 text-left">
      {song.artworkUrl ? (
        <img
          src={song.artworkUrl}
          alt={song.album}
          className="w-10 h-10 rounded object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gray-100 flex-shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{song.title}</p>
        <p className="text-xs text-gray-400 truncate">{song.artist}</p>
      </div>
    </div>
  );
}
