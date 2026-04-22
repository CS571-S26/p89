/**
 * musicKit - thin wrapper around MusicKit JS v3.
 *
 * Handles SDK initialization, user authorization, and library API requests.
 * All exported functions that call the API will automatically ensure MusicKit
 * is configured before proceeding.
 *
 * The developer token is read from the VITE_APPLE_DEV_TOKEN environment variable.
 */
import type { Playlist, Song } from '../types';

type PlaylistResource = MusicKit.Resource<MusicKit.LibraryPlaylistAttributes>;
type SongResource = MusicKit.Resource<MusicKit.LibrarySongAttributes>;

/** Cached promise so configure is only attempted once. */
let configurePromise: Promise<void> | null = null;

/** Resolves to the singleton MusicKit instance after configuration. */
function getInstance(): MusicKit.MusicKitInstance {
  return window.MusicKit.getInstance();
}

/** Resolves an artwork URL template to an absolute URL at the given pixel size. */
function resolveArtworkUrl(
  descriptor: MusicKit.ArtworkDescriptor | undefined,
  size = 300
): string | undefined {
  if (!descriptor?.url) return undefined;
  return descriptor.url
    .replace('{w}', String(size))
    .replace('{h}', String(size));
}

/** Resolves when the MusicKit JS SDK has finished loading on the page. */
async function waitForMusicKit(): Promise<void> {
  if (window.MusicKit) return;
  return new Promise(resolve => {
    document.addEventListener('musickitloaded', () => resolve(), {
      once: true,
    });
  });
}

/**
 * Configures MusicKit JS with the developer token.
 * Safe to call multiple times - only runs once and caches the result.
 * Call this at app startup to reduce latency on first sign-in.
 */
export function configureMusicKit(): Promise<void> {
  if (!configurePromise) {
    configurePromise = (async () => {
      await waitForMusicKit();
      await window.MusicKit.configure({
        developerToken: import.meta.env.VITE_APPLE_DEV_TOKEN as string,
        app: { name: 'Audify', build: '1.0.0' },
      });
    })();
  }
  return configurePromise;
}

/**
 * Returns true if the user has already authorized the app with Apple Music.
 */
export async function isAuthorized(): Promise<boolean> {
  await configureMusicKit();
  return getInstance().isAuthorized;
}

/**
 * Prompts the user to sign in with Apple Music.
 * Returns the user token string on success.
 */
export async function authorize(): Promise<string> {
  await configureMusicKit();
  return getInstance().authorize();
}

/** Signs the current user out of Apple Music. */
export async function unauthorize(): Promise<void> {
  await configureMusicKit();
  return getInstance().unauthorize();
}

/**
 * Fetches all playlists from the user's Apple Music library.
 * Paginates automatically until all playlists are retrieved.
 */
export async function fetchLibraryPlaylists(): Promise<Playlist[]> {
  await configureMusicKit();
  const music = getInstance();
  const results: PlaylistResource[] = [];
  let path: string | undefined = '/v1/me/library/playlists?limit=100';

  while (path) {
    // eslint-disable-next-line no-await-in-loop
    const envelope = (await music.api.music(path))
      .data as MusicKit.PagedResponse<PlaylistResource[]>;
    results.push(...envelope.data);
    path = envelope.next;
  }

  return results.map(resource => ({
    id: resource.id,
    name: resource.attributes.name,
    songCount: 0,
    artworkUrl: resolveArtworkUrl(resource.attributes.artwork),
  }));
}

/**
 * Fetches all tracks from a library playlist.
 * Paginates automatically until all tracks are retrieved.
 */
export async function fetchPlaylistTracks(playlistId: string): Promise<Song[]> {
  await configureMusicKit();
  const music = getInstance();
  const results: SongResource[] = [];
  let path: string | undefined =
    `/v1/me/library/playlists/${playlistId}/tracks?limit=100`;

  while (path) {
    // eslint-disable-next-line no-await-in-loop
    const envelope = (await music.api.music(path))
      .data as MusicKit.PagedResponse<SongResource[]>;
    results.push(...envelope.data);
    path = envelope.next;
  }

  return results.map(resource => ({
    id: resource.id,
    title: resource.attributes.name,
    artist: resource.attributes.artistName,
    album: resource.attributes.albumName,
    duration: Math.round(resource.attributes.durationInMillis / 1000),
    artworkUrl: resolveArtworkUrl(resource.attributes.artwork),
    previewUrl: resource.attributes.previews?.[0]?.url,
  }));
}

/**
 * Removes tracks from a library playlist.
 * Note: track removal is not officially documented in the Apple Music API
 * and may not be supported on all accounts.
 */
export async function removeTracksFromPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  await configureMusicKit();
  await getInstance().api.music(
    `/v1/me/library/playlists/${playlistId}/tracks`,
    {
      fetchOptions: {
        method: 'DELETE',
        body: JSON.stringify({
          data: songs.map(s => ({ id: s.id, type: 'library-songs' })),
        }),
      },
    }
  );
}

/**
 * Adds tracks to a library playlist.
 */
export async function addTracksToPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  await configureMusicKit();
  await getInstance().api.music(
    `/v1/me/library/playlists/${playlistId}/tracks`,
    {
      fetchOptions: {
        method: 'POST',
        body: JSON.stringify({
          data: songs.map(s => ({ id: s.id, type: 'library-songs' })),
        }),
      },
    }
  );
}
