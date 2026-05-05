// Server-only Spotify helpers. Refresh-token flow: a one-time auth code
// exchange (done locally by the developer) yields a long-lived refresh token
// that lives in Vercel env vars. Each API call exchanges that for a short-lived
// access token, then hits the Web API.
//
// Required env vars:
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

export interface SpotifyEnv {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}

export function getSpotifyEnv(): SpotifyEnv | null {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;
  return {
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    refreshToken: SPOTIFY_REFRESH_TOKEN,
  };
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(env: SpotifyEnv): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 30_000) {
    return cachedAccessToken.token;
  }
  const basic = Buffer.from(`${env.clientId}:${env.clientSecret}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: env.refreshToken,
    }).toString(),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`spotify token failed: ${res.status}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };
  return data.access_token;
}

interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: { spotify: string };
  duration_ms: number;
}

export interface NowPlayingResponse {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImage?: string;
  songUrl?: string;
  progressMs?: number;
  durationMs?: number;
}

export async function fetchNowPlaying(env: SpotifyEnv): Promise<NowPlayingResponse> {
  const access = await getAccessToken(env);
  const res = await fetch(
    "https://api.spotify.com/v1/me/player/currently-playing",
    { headers: { Authorization: `Bearer ${access}` }, cache: "no-store" },
  );
  if (res.status === 204 || res.status === 202) return { isPlaying: false };
  if (!res.ok) throw new Error(`spotify now-playing failed: ${res.status}`);
  const data = (await res.json()) as {
    is_playing: boolean;
    progress_ms: number;
    item: SpotifyTrack | null;
  };
  if (!data || !data.item || !data.is_playing) return { isPlaying: false };
  const item = data.item;
  return {
    isPlaying: true,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(", "),
    album: item.album.name,
    albumImage: item.album.images[0]?.url,
    songUrl: item.external_urls.spotify,
    progressMs: data.progress_ms,
    durationMs: item.duration_ms,
  };
}

export interface TopTracksResponse {
  tracks: {
    title: string;
    artist: string;
    albumImage: string;
    url: string;
  }[];
}

export async function fetchTopTracks(env: SpotifyEnv): Promise<TopTracksResponse> {
  const access = await getAccessToken(env);
  const res = await fetch(
    "https://api.spotify.com/v1/me/top/tracks?limit=5&time_range=short_term",
    { headers: { Authorization: `Bearer ${access}` }, cache: "no-store" },
  );
  if (!res.ok) throw new Error(`spotify top-tracks failed: ${res.status}`);
  const data = (await res.json()) as { items: SpotifyTrack[] };
  return {
    tracks: data.items.map((it) => ({
      title: it.name,
      artist: it.artists.map((a) => a.name).join(", "),
      albumImage: it.album.images[1]?.url ?? it.album.images[0]?.url ?? "",
      url: it.external_urls.spotify,
    })),
  };
}
