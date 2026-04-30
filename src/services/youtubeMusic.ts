import type { Playlist, Song } from '../types';

const GIS_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube';
const TOKEN_KEY = 'audify.youtube.token';
const TOKEN_EXPIRY_KEY = 'audify.youtube.tokenExpiry';

let tokenClientPromise:
  | Promise<google.accounts.oauth2.TokenClient>
  | null = null;
let accessToken = sessionStorage.getItem(TOKEN_KEY);
let tokenExpiry = Number(sessionStorage.getItem(TOKEN_EXPIRY_KEY) ?? '0');

function storeToken(token: string, expiresInSeconds: number) {
  accessToken = token;
  tokenExpiry = Date.now() + expiresInSeconds * 1000;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(tokenExpiry));
}

function clearToken() {
  accessToken = null;
  tokenExpiry = 0;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
}

function hasValidToken() {
  return Boolean(accessToken && Date.now() < tokenExpiry);
}

function resolveYouTubeThumbnail(
  thumbnails: Record<string, { url: string }> | undefined
): string | undefined {
  return (
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url
  );
}

async function loadGoogleAccountsScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) return;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${GIS_SCRIPT_SRC}"]`
  );

  if (existing) {
    await new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Identity Services.')),
        { once: true }
      );
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Identity Services.'));
    document.head.appendChild(script);
  });
}

async function getTokenClient(): Promise<google.accounts.oauth2.TokenClient> {
  if (!tokenClientPromise) {
    tokenClientPromise = (async () => {
      console.info('[YouTubeMusic] Loading Google Identity Services');
      await loadGoogleAccountsScript();

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
        | string
        | undefined;
      if (!clientId) {
        console.error('[YouTubeMusic] Missing VITE_GOOGLE_CLIENT_ID');
        throw new Error('Missing VITE_GOOGLE_CLIENT_ID.');
      }

      console.info('[YouTubeMusic] Initializing Google token client');
      return window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: YOUTUBE_SCOPE,
        callback: () => {},
      });
    })();
  }

  return tokenClientPromise;
}

export async function configureYouTubeMusic(): Promise<void> {
  await getTokenClient();
}

export async function isYouTubeAuthorized(): Promise<boolean> {
  await configureYouTubeMusic().catch(() => {});
  return hasValidToken();
}

export async function authorizeYouTubeMusic(): Promise<string> {
  const client = await getTokenClient();

  return new Promise((resolve, reject) => {
    client.callback = response => {
      console.info('[YouTubeMusic] OAuth callback received', response);
      if (response.error) {
        console.error('[YouTubeMusic] OAuth returned error', response.error);
        reject(new Error(response.error));
        return;
      }
      if (!response.access_token || !response.expires_in) {
        console.error(
          '[YouTubeMusic] OAuth response missing access token or expiry',
          response
        );
        reject(new Error('Google authorization did not return an access token.'));
        return;
      }

      storeToken(response.access_token, response.expires_in);
      resolve(response.access_token);
    };

    console.info('[YouTubeMusic] Requesting Google access token');
    client.requestAccessToken({
      prompt: hasValidToken() ? '' : 'consent',
    });
  });
}

export async function unauthorizeYouTubeMusic(): Promise<void> {
  await configureYouTubeMusic().catch(() => {});

  const token = accessToken;
  if (token && window.google?.accounts?.oauth2) {
    await new Promise<void>(resolve => {
      window.google.accounts.oauth2.revoke(token, () => resolve());
    });
  }

  clearToken();
}

async function youtubeRequest<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!hasValidToken()) {
    console.error('[YouTubeMusic] Request blocked: token missing or expired', {
      path,
      hasToken: Boolean(accessToken),
      tokenExpiry,
      now: Date.now(),
    });
    throw new Error('YouTube authorization has expired.');
  }

  console.info('[YouTubeMusic] API request', {
    path,
    method: init?.method ?? 'GET',
  });
  const response = await fetch(`https://www.googleapis.com/youtube/v3/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    console.error('[YouTubeMusic] API request failed', {
      path,
      method: init?.method ?? 'GET',
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error(`YouTube API error: ${response.status}`);
  }

  console.info('[YouTubeMusic] API request succeeded', {
    path,
    method: init?.method ?? 'GET',
    status: response.status,
  });
  return (await response.json()) as T;
}

type YouTubePlaylistListResponse = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      thumbnails?: Record<string, { url: string }>;
    };
    contentDetails?: {
      itemCount?: number;
    };
  }>;
  nextPageToken?: string;
};

type YouTubeVideoListResponse = {
  items: Array<{
    id: string;
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails?: Record<string, { url: string }>;
      categoryId?: string;
    };
    contentDetails?: {
      duration?: string;
    };
  }>;
};

type YouTubePlaylistItemListResponse = {
  items: Array<{
    contentDetails?: {
      videoId?: string;
    };
    snippet: {
      title: string;
      videoOwnerChannelTitle?: string;
      channelTitle: string;
      thumbnails?: Record<string, { url: string }>;
    };
  }>;
  nextPageToken?: string;
};

function parseIsoDurationToSeconds(duration: string | undefined): number {
  if (!duration) return 0;
  const match =
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(duration);
  if (!match) return 0;

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchYouTubePlaylists(): Promise<Playlist[]> {
  console.info('[YouTubeMusic] Fetching user playlists');
  const playlists: Playlist[] = [];
  let pageToken = '';

  do {
    const query = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults: '50',
    });
    if (pageToken) query.set('pageToken', pageToken);

    const response = await youtubeRequest<YouTubePlaylistListResponse>(
      `playlists?${query.toString()}`
    );

    playlists.push(
      ...response.items.map(item => ({
        id: item.id,
        name: item.snippet.title,
        songCount: item.contentDetails?.itemCount ?? 0,
        artworkUrl: resolveYouTubeThumbnail(item.snippet.thumbnails),
      }))
    );

    pageToken = response.nextPageToken ?? '';
  } while (pageToken);

  console.info('[YouTubeMusic] Loaded playlists', {
    count: playlists.length,
  });
  return playlists;
}

export async function createYouTubePlaylist(name: string): Promise<Playlist> {
  console.info('[YouTubeMusic] Creating playlist', { name });
  const response = await youtubeRequest<YouTubePlaylistListResponse>(
    'playlists?part=snippet,status',
    {
      method: 'POST',
      body: JSON.stringify({
        snippet: { title: name },
        status: { privacyStatus: 'private' },
      }),
    }
  );

  const playlist = response.items[0];
  console.info('[YouTubeMusic] Playlist created', {
    id: playlist.id,
    title: playlist.snippet.title,
  });
  return {
    id: playlist.id,
    name: playlist.snippet.title,
    songCount: playlist.contentDetails?.itemCount ?? 0,
    artworkUrl: resolveYouTubeThumbnail(playlist.snippet.thumbnails),
  };
}

export async function fetchYouTubeSuggestions(): Promise<Song[]> {
  console.info('[YouTubeMusic] Fetching suggestion candidates');
  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    chart: 'mostPopular',
    videoCategoryId: '10',
    maxResults: '25',
    regionCode: 'US',
  });

  const response = await youtubeRequest<YouTubeVideoListResponse>(
    `videos?${query.toString()}`
  );

  const songs = response.items.map(item => ({
    id: item.id,
    title: item.snippet.title,
    artist: item.snippet.channelTitle,
    album: 'YouTube Music',
    duration: parseIsoDurationToSeconds(item.contentDetails?.duration),
    artworkUrl: resolveYouTubeThumbnail(item.snippet.thumbnails),
  }));

  console.info('[YouTubeMusic] Suggestions loaded', {
    count: songs.length,
  });

  return songs;
}

export async function addYouTubeTracksToPlaylist(
  playlistId: string,
  songs: Song[]
): Promise<void> {
  console.info('[YouTubeMusic] Adding tracks to playlist', {
    playlistId,
    trackCount: songs.length,
  });
  for (const song of songs) {
    console.info('[YouTubeMusic] Inserting playlist item', {
      playlistId,
      videoId: song.id,
      title: song.title,
    });
    await youtubeRequest('playlistItems?part=snippet', {
      method: 'POST',
      body: JSON.stringify({
        snippet: {
          playlistId,
          resourceId: {
            kind: 'youtube#video',
            videoId: song.id,
          },
        },
      }),
    });
  }
  console.info('[YouTubeMusic] Finished adding tracks to playlist', {
    playlistId,
    trackCount: songs.length,
  });
}

export async function fetchYouTubePlaylistTracks(
  playlistId: string
): Promise<Song[]> {
  console.info('[YouTubeMusic] Fetching playlist tracks', { playlistId });
  const songs: Song[] = [];
  let pageToken = '';

  do {
    const query = new URLSearchParams({
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: '50',
    });
    if (pageToken) query.set('pageToken', pageToken);

    const response = await youtubeRequest<YouTubePlaylistItemListResponse>(
      `playlistItems?${query.toString()}`
    );

    songs.push(
      ...response.items
        .filter(item => item.contentDetails?.videoId)
        .map(item => ({
          id: item.contentDetails!.videoId!,
          title: item.snippet.title,
          artist:
            item.snippet.videoOwnerChannelTitle ?? item.snippet.channelTitle,
          album: 'YouTube Music',
          duration: 0,
          artworkUrl: resolveYouTubeThumbnail(item.snippet.thumbnails),
        }))
    );

    pageToken = response.nextPageToken ?? '';
  } while (pageToken);

  console.info('[YouTubeMusic] Playlist tracks loaded', {
    playlistId,
    count: songs.length,
  });
  return songs;
}
