/**
 * LoginPage - entry point of the app.
 * Offers Apple Music, YouTube Music, or demo entry into the app.
 * If the user is already authorized, the relevant button reads "Continue" instead.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { MusicProvider } from '../types';
import {
  authorize,
  isAuthorized,
  setCurrentProvider,
} from '../services/musicService';
import PageHeader from '../components/PageHeader';
import StatusMessage from '../components/StatusMessage';

export default function LoginPage() {
  const navigate = useNavigate();
  const [appleAuthorized, setAppleAuthorized] = useState(false);
  const [youtubeAuthorized, setYouTubeAuthorized] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<MusicProvider | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    isAuthorized('apple').then(setAppleAuthorized).catch(err => {
      console.error('[Auth] Failed to check Apple Music auth state', err);
    });
    isAuthorized('youtube').then(setYouTubeAuthorized).catch(err => {
      console.error('[Auth] Failed to check YouTube Music auth state', err);
    });
  }, []);

  async function handleSignIn(provider: MusicProvider) {
    setLoadingProvider(provider);
    setError(null);
    console.info(`[Auth] Starting sign-in for provider: ${provider}`);
    try {
      await authorize(provider);
      console.info(`[Auth] Sign-in succeeded for provider: ${provider}`);
      navigate('/playlists');
    } catch (err) {
      console.error(`[Auth] Sign-in failed for provider: ${provider}`, err);
      const message =
        err instanceof Error ? err.message : 'Unknown sign-in error.';
      setError(`Sign in failed for ${provider}. ${message}`);
    } finally {
      setLoadingProvider(null);
    }
  }

  function handleDemo() {
    setCurrentProvider('apple');
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

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          onClick={() => handleSignIn('apple')}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === 'apple'
            ? 'Signing in...'
            : appleAuthorized
              ? 'Continue with Apple Music'
              : 'Sign in with Apple Music'}
        </button>
        <button
          type="button"
          className="px-6 py-3 rounded-full border border-gray-300 bg-white font-medium text-gray-900 transition-colors hover:border-gray-950 disabled:opacity-50"
          onClick={() => handleSignIn('youtube')}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === 'youtube'
            ? 'Signing in...'
            : youtubeAuthorized
              ? 'Continue with YouTube Music'
              : 'Sign in with YouTube Music'}
        </button>
        <p className="max-w-sm text-center text-xs text-gray-700">
          Apple Music uses Apple&apos;s recommendation feed. YouTube Music uses
          Google sign-in and YouTube playlist APIs.
        </p>
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
