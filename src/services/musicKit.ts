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
type CatalogSongResource = MusicKit.Resource<MusicKit.CatalogSongAttributes>;

/** Cached promise so configure is only attempted once. */
let configurePromise: Promise<void> | null = null;

/** User token stored after a successful authorization. */
let userToken: string | null = null;

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
 * Stores the user token for use in authenticated write requests.
 * Returns the user token string on success.
 */
export async function authorize(): Promise<string> {
  await configureMusicKit();
  userToken = await getInstance().authorize();
  return userToken;
}

/**
 * Makes an authenticated POST request to the Apple Music API.
 * Uses the cached developer token and user token as auth headers.
 */
async function authenticatedPost(
  path: string,
  body: unknown
): Promise<Response> {
  const devToken = import.meta.env.VITE_APPLE_DEV_TOKEN as string;
  const token = userToken ?? getInstance().musicUserToken;
  const url = `https://api.music.apple.com${path}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${devToken}`,
      'Music-User-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Apple Music API error: ${response.status}`);
  }
  return response;
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

/** Maps a raw library song resource to the app's Song type. */
function mapSongResource(resource: SongResource): Song {
  return {
    id: resource.id,
    title: resource.attributes.name,
    artist: resource.attributes.artistName,
    album: resource.attributes.albumName,
    duration: Math.round(resource.attributes.durationInMillis / 1000),
    artworkUrl: resolveArtworkUrl(resource.attributes.artwork),
    previewUrl: resource.attributes.previews?.[0]?.url,
  };
}

/** Maps a catalog song resource to the app's Song type. */
function mapCatalogSongResource(resource: CatalogSongResource): Song {
  return {
    id: resource.id,
    title: resource.attributes.name,
    artist: resource.attributes.artistName,
    album: resource.attributes.albumName,
    duration: Math.round(resource.attributes.durationInMillis / 1000),
    artworkUrl: resolveArtworkUrl(resource.attributes.artwork),
    previewUrl: resource.attributes.previews?.[0]?.url,
  };
}

/** Paginates through a library song endpoint and returns all results. */
async function fetchAllSongResources(
  music: MusicKit.MusicKitInstance,
  startPath: string
): Promise<SongResource[]> {
  const results: SongResource[] = [];
  let path: string | undefined = startPath;
  while (path) {
    const envelope = (await music.api.music(path))
      .data as MusicKit.PagedResponse<SongResource[]>;
    results.push(...envelope.data);
    path = envelope.next;
  }
  return results;
}

/**
 * Fetches all tracks from a library playlist.
 * Paginates automatically until all tracks are retrieved.
 */
export async function fetchPlaylistTracks(playlistId: string): Promise<Song[]> {
  await configureMusicKit();
  const music = getInstance();
  const resources = await fetchAllSongResources(
    music,
    `/v1/me/library/playlists/${playlistId}/tracks?limit=100`
  );
  return resources.map(mapSongResource);
}

/**
 * Fetches personalized song suggestions using Apple Music recommendations.
 *
 * Fetches the user's storefront and personal recommendations in parallel, then
 * collects tracks from the recommended albums concurrently. Up to 5 albums are
 * sampled, taking 5 tracks each, giving roughly 25 candidate songs.
 */
export async function fetchSongSuggestions(): Promise<Song[]> {
  await configureMusicKit();
  const music = getInstance();

  const [storefrontRes, recsRes] = await Promise.all([
    music.api
      .music('/v1/me/storefront')
      .then(
        r => r.data as MusicKit.PagedResponse<MusicKit.StorefrontResource[]>
      ),
    music.api
      .music('/v1/me/recommendations?limit=10')
      .then(
        r => r.data as MusicKit.PagedResponse<MusicKit.RecommendationResource[]>
      ),
  ]);

  const storefront = storefrontRes.data[0]?.id ?? 'us';

  // Collect unique album IDs from all recommendation contents
  const albumIds = [
    ...new Set(
      recsRes.data
        .flatMap(rec => rec.relationships.contents.data)
        .filter(item => item.type === 'albums')
        .map(item => item.id)
    ),
  ].slice(0, 5);

  // Fetch tracks from each recommended album in parallel
  const trackGroups = await Promise.all(
    albumIds.map(albumId =>
      music.api
        .music(`/v1/catalog/${storefront}/albums/${albumId}/tracks?limit=5`)
        .then(
          r => (r.data as MusicKit.PagedResponse<CatalogSongResource[]>).data
        )
        .catch(() => [] as CatalogSongResource[])
    )
  );

  // Flatten and deduplicate by ID
  const seen = new Set<string>();
  return trackGroups
    .flat()
    .filter(track => {
      if (seen.has(track.id)) return false;
      seen.add(track.id);
      return true;
    })
    .map(mapCatalogSongResource);
}

/**
 * Creates a new empty playlist in the user's Apple Music library.
 * Returns the created playlist.
 */
export async function createPlaylist(name: string): Promise<Playlist> {
  await configureMusicKit();
  const response = await authenticatedPost('/v1/me/library/playlists', {
    attributes: { name },
  });
  const envelope = (await response.json()) as MusicKit.PagedResponse<
    PlaylistResource[]
  >;
  const resource = envelope.data[0];
  return {
    id: resource.id,
    name: resource.attributes.name,
    songCount: 0,
    artworkUrl: resolveArtworkUrl(resource.attributes.artwork),
  };
}

/**
 * Adds catalog songs to a library playlist.
 * Songs sourced from Apple Music suggestions use the catalog 'songs' type.
 */
export async function addTracksToPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  await configureMusicKit();
  await authenticatedPost(`/v1/me/library/playlists/${playlistId}/tracks`, {
    data: songs.map(s => ({ id: s.id, type: 'songs' })),
  });
}
