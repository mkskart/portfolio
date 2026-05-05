import { NextResponse } from "next/server";
import { fetchNowPlaying, getSpotifyEnv } from "@/lib/spotify";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const env = getSpotifyEnv();
  if (!env) {
    return NextResponse.json(
      { isPlaying: false },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" } },
    );
  }
  try {
    const data = await fetchNowPlaying(env);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json({ isPlaying: false }, { status: 200 });
  }
}
