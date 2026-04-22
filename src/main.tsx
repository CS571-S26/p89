import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { configureMusicKit } from './services/musicKit';

/** Start loading MusicKit JS early so it is ready before the user signs in. */
configureMusicKit().catch(() => {
  // Errors here are surfaced per-page when the user tries to sign in.
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
