import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { configureMusicProviders } from './services/musicService';

/** Start loading provider SDKs early so sign-in is responsive. */
configureMusicProviders().catch(() => {
  // Provider-specific errors are surfaced when the user attempts to sign in.
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
