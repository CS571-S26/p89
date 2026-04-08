/**
 * LoginPage — entry point of the app.
 * Authentication is stubbed; the button navigates directly to playlist selection.
 */
import { useNavigate } from 'react-router';

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 min-h-[calc(100vh-57px)]">
      <h1 className="text-4xl font-bold tracking-tight">Audify</h1>
      <p className="text-gray-500 text-sm">Manage your playlists, one swipe at a time.</p>
      <button
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
        onClick={() => navigate('/playlists')}
      >
        Sign in with Apple Music
      </button>
    </div>
  );
}
