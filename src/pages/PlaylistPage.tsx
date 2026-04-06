/**
 * PlaylistPage — displays the user's playlists and lets them pick one.
 * Playlist data is stubbed until Apple Music integration is wired up.
 */
import { useNavigate } from 'react-router';
import type { Playlist } from '../types';

/** Stub playlists used until real API data is available. */
const STUB_PLAYLISTS: Playlist[] = [
  { id: '1', name: 'Chill Vibes', songCount: 42 },
  { id: '2', name: 'Workout Mix', songCount: 18 },
  { id: '3', name: 'Road Trip', songCount: 31 },
  { id: '4', name: 'Late Night', songCount: 27 },
];

export default function PlaylistPage() {
  const navigate = useNavigate();

  function selectPlaylist(playlist: Playlist) {
    navigate('/mode', { state: { playlistId: playlist.id } });
  }

  return (
    <div className="flex flex-col items-center min-h-screen px-4 py-12 gap-8">
      <h2 className="text-2xl font-semibold">Your Playlists</h2>
      <ul className="w-full max-w-sm flex flex-col gap-3">
        {STUB_PLAYLISTS.map((playlist) => (
          <li key={playlist.id}>
            <button
              className="w-full flex items-center justify-between px-4 py-4 border border-gray-200 rounded-2xl hover:border-black transition-colors"
              onClick={() => selectPlaylist(playlist)}
            >
              <span className="font-medium">{playlist.name}</span>
              <span className="text-sm text-gray-400">{playlist.songCount} songs</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
