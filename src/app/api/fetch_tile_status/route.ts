import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

type DbTileRow = {
  lat: number;
  lng: number;
  fetched: boolean;
  last_fetched: string | null;
};

export async function GET(request: NextRequest) {
  const tileId = request.nextUrl.searchParams.get("tileId");

  if (!tileId) {
    return NextResponse.json(
      { error: "Missing required query param: tileId" },
      { status: 400 },
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Missing DATABASE_URL" },
      { status: 500 },
    );
  }

  const sql = neon(databaseUrl);
  console.log(`Fetching tile status for tileId: ${tileId}`); // Debug log

  try {
    const result = (await sql`
      SELECT
        ST_Y(center::geometry) AS lat,
        ST_X(center::geometry) AS lng,
        fetched,
        last_fetched
      FROM map_tiles
      WHERE tile_id = ${tileId}
      LIMIT 1
    `) as DbTileRow[];

    if (result.length === 0) {
      return NextResponse.json(
        { tileId, lat: 0, lng: 0, fetched: false, lastFetched: null },
        { status: 200 },
      );
    }

    if (result.length > 1) {
      console.warn(
        `Multiple entries found for tile ${tileId}. Using the first one.`,
      );
    }

    return NextResponse.json(
      {
        tileId,
        lat: Number(result[0].lat),
        lng: Number(result[0].lng),
        fetched: Boolean(result[0].fetched),
        lastFetched: result[0].last_fetched,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch tile status from database",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
