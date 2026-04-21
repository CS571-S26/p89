/**
 * LoginPage — entry point of the app.
 * Prompts the user to authorize with Apple Music, then navigates to playlist selection.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authorize } from '../services/musicKit';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await authorize();
      navigate('/playlists');
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 min-h-[calc(100vh-57px)]">
      <h1 className="text-4xl font-bold tracking-tight">Audify</h1>
      <p className="text-gray-500 text-sm">Manage your playlists, one swipe at a time.</p>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign in with Apple Music'}
      </button>
    </div>
  );
}
