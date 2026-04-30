import type { MusicProvider, Playlist, Song } from '../types';
import {
  addAppleTracksToPlaylist,
  authorizeAppleMusic,
  configureAppleMusic,
  createApplePlaylist,
  fetchApplePlaylists,
  fetchAppleSuggestions,
  isAppleAuthorized,
  unauthorizeAppleMusic,
} from './appleMusic';
import {
  addYouTubeTracksToPlaylist,
  authorizeYouTubeMusic,
  configureYouTubeMusic,
  createYouTubePlaylist,
  fetchYouTubePlaylists,
  fetchYouTubeSuggestions,
  isYouTubeAuthorized,
  unauthorizeYouTubeMusic,
} from './youtubeMusic';

const PROVIDER_KEY = 'audify.provider';

export function configureMusicProviders(): Promise<void> {
  return Promise.allSettled([
    configureAppleMusic(),
    configureYouTubeMusic(),
  ]).then(() => undefined);
}

export function getCurrentProvider(): MusicProvider {
  const stored = localStorage.getItem(PROVIDER_KEY);
  return stored === 'youtube' ? 'youtube' : 'apple';
}

export function setCurrentProvider(provider: MusicProvider) {
  localStorage.setItem(PROVIDER_KEY, provider);
}

export async function isAuthorized(
  provider: MusicProvider
): Promise<boolean> {
  if (provider === 'youtube') {
    return isYouTubeAuthorized();
  }
  return isAppleAuthorized();
}

export async function authorize(provider: MusicProvider): Promise<void> {
  console.info(`[MusicService] Authorizing provider: ${provider}`);
  if (provider === 'youtube') {
    await authorizeYouTubeMusic();
  } else {
    await authorizeAppleMusic();
  }
  setCurrentProvider(provider);
  console.info(`[MusicService] Provider authorized: ${provider}`);
}

export async function unauthorizeCurrentProvider(): Promise<void> {
  const provider = getCurrentProvider();
  if (provider === 'youtube') {
    await unauthorizeYouTubeMusic();
  } else {
    await unauthorizeAppleMusic();
  }
}

export async function fetchLibraryPlaylists(): Promise<Playlist[]> {
  const provider = getCurrentProvider();
  return provider === 'youtube'
    ? fetchYouTubePlaylists()
    : fetchApplePlaylists();
}

export async function createPlaylist(name: string): Promise<Playlist> {
  const provider = getCurrentProvider();
  return provider === 'youtube'
    ? createYouTubePlaylist(name)
    : createApplePlaylist(name);
}

export async function fetchSongSuggestions(): Promise<Song[]> {
  const provider = getCurrentProvider();
  return provider === 'youtube'
    ? fetchYouTubeSuggestions()
    : fetchAppleSuggestions();
}

export async function addTracksToPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  const provider = getCurrentProvider();
  if (provider === 'youtube') {
    await addYouTubeTracksToPlaylist(playlistId, songs);
    return;
  }
  await addAppleTracksToPlaylist(playlistId, songs);
}
