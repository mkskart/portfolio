import { NextResponse } from "next/server";
import { fetchTopTracks, getSpotifyEnv } from "@/lib/spotify";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET() {
  const env = getSpotifyEnv();
  if (!env) {
    return NextResponse.json(
      { tracks: [] },
      { status: 200, headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  }
  try {
    const data = await fetchTopTracks(env);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json({ tracks: [] }, { status: 200 });
  }
}
