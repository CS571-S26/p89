/**
 * LoginPage - entry point of the app.
 * Offers Apple Music sign-in or a demo mode that uses stub data.
 * If the user is already authorized, the button reads "Continue" instead.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { authorize, isAuthorized } from '../services/musicKit';
import PageHeader from '../components/PageHeader';
import StatusMessage from '../components/StatusMessage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isAuthorized()
      .then(setAuthorized)
      .catch(() => {});
  }, []);

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      if (!authorized) await authorize();
      navigate('/playlists');
    } catch {
      setError('Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemo() {
    navigate('/playlists', { state: { demo: true } });
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 min-h-[calc(100vh-57px)]">
      <PageHeader
        title="Audify"
        subtitle="Manage your playlists, one swipe at a time."
        centered
      />

      {error && (
        <StatusMessage tone="error" live="assertive">
          {error}
        </StatusMessage>
      )}

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading
            ? 'Signing in...'
            : authorized
              ? 'Continue'
              : 'Sign in with Apple Music'}
        </button>
        {!authorized && (
          <p className="text-xs text-gray-700">
            Requires an active Apple Music subscription.
          </p>
        )}
      </div>

      <button
        type="button"
        className="text-sm font-medium text-gray-700 hover:text-black transition-colors"
        onClick={handleDemo}
      >
        Try a demo - no account needed
      </button>
    </div>
  );
}
