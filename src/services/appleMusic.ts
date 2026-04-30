import type { Playlist, Song } from '../types';

type PlaylistResource = MusicKit.Resource<MusicKit.LibraryPlaylistAttributes>;
type SongResource = MusicKit.Resource<MusicKit.LibrarySongAttributes>;
type CatalogSongResource = MusicKit.Resource<MusicKit.CatalogSongAttributes>;

let configurePromise: Promise<void> | null = null;
let userToken: string | null = null;

function getInstance(): MusicKit.MusicKitInstance {
  return window.MusicKit.getInstance();
}

function resolveArtworkUrl(
  descriptor: MusicKit.ArtworkDescriptor | undefined,
  size = 300
): string | undefined {
  if (!descriptor?.url) return undefined;
  return descriptor.url
    .replace('{w}', String(size))
    .replace('{h}', String(size));
}

async function waitForMusicKit(): Promise<void> {
  if (window.MusicKit) return;
  return new Promise(resolve => {
    document.addEventListener('musickitloaded', () => resolve(), {
      once: true,
    });
  });
}

export function configureAppleMusic(): Promise<void> {
  if (!configurePromise) {
    configurePromise = (async () => {
      console.info('[AppleMusic] Waiting for MusicKit');
      await waitForMusicKit();
      console.info('[AppleMusic] Configuring MusicKit');
      await window.MusicKit.configure({
        developerToken: import.meta.env.VITE_APPLE_DEV_TOKEN as string,
        app: { name: 'Audify', build: '1.0.0' },
      });
    })();
  }
  return configurePromise;
}

export async function isAppleAuthorized(): Promise<boolean> {
  await configureAppleMusic();
  return getInstance().isAuthorized;
}

export async function authorizeAppleMusic(): Promise<string> {
  await configureAppleMusic();
  console.info('[AppleMusic] Requesting authorization');
  userToken = await getInstance().authorize();
  console.info('[AppleMusic] Authorization succeeded');
  return userToken;
}

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

export async function unauthorizeAppleMusic(): Promise<void> {
  await configureAppleMusic();
  return getInstance().unauthorize();
}

export async function fetchApplePlaylists(): Promise<Playlist[]> {
  await configureAppleMusic();
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

export async function fetchAppleSuggestions(): Promise<Song[]> {
  await configureAppleMusic();
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

  const albumIds = [
    ...new Set(
      recsRes.data
        .flatMap(rec => rec.relationships.contents.data)
        .filter(item => item.type === 'albums')
        .map(item => item.id)
    ),
  ].slice(0, 5);

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

export async function createApplePlaylist(name: string): Promise<Playlist> {
  await configureAppleMusic();
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

export async function addAppleTracksToPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  await configureAppleMusic();
  await authenticatedPost(`/v1/me/library/playlists/${playlistId}/tracks`, {
    data: songs.map(song => ({ id: song.id, type: 'songs' })),
  });
}

export async function fetchApplePlaylistTracks(
  playlistId: string
): Promise<Song[]> {
  await configureAppleMusic();
  const music = getInstance();
  const results: SongResource[] = [];
  let path: string | undefined =
    `/v1/me/library/playlists/${playlistId}/tracks?limit=100`;

  while (path) {
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
