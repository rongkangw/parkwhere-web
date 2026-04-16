"use server";

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import ParkingSpot from "@/core/constants/ParkingSpot";
import createParkingSpotKey from "@/app/utils/createParkingSpotId";

type UpdateDbSpotsRequest = {
  tileId: string;
  centerLat: number;
  centerLng: number;
  spots: ParkingSpot[];
};

export async function POST(request: NextRequest) {
  let body: UpdateDbSpotsRequest;

  try {
    body = (await request.json()) as UpdateDbSpotsRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { tileId, centerLat, centerLng, spots } = body;

  if (
    !tileId ||
    Number.isNaN(centerLat) ||
    Number.isNaN(centerLng) ||
    !Array.isArray(spots)
  ) {
    return NextResponse.json(
      {
        error: "Invalid body. Required: tileId, centerLat, centerLng, spots[]",
      },
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
  try {
    // Deduplicate spots by their unique key (lat,lng) to avoid DB conflicts.
    const uniqueSpots = Array.from(
      new Map(
        spots.map((spot) => [createParkingSpotKey(spot.lat, spot.lng), spot]),
      ).values(),
    );

    await sql`
      INSERT INTO parking_spots (
        uniqueid,
        name,
        location,
        occupancy,
        capacity,
        sheltered,
        racktype,
        type
      )
      SELECT
        t.uniqueid,
        t.name,
        ST_SetSRID(ST_MakePoint(t.lng, t.lat), 4326)::geography,
        t.occupancy,
        t.capacity,
        t.sheltered,
        t.racktype,
        t.type
      FROM UNNEST(
        ${uniqueSpots.map((s) => createParkingSpotKey(s.lat, s.lng))}::text[],
        ${uniqueSpots.map((s) => s.name)}::text[],
        ${uniqueSpots.map((s) => s.lng)}::float8[],
        ${uniqueSpots.map((s) => s.lat)}::float8[],
        ${uniqueSpots.map((s) => s.occupancy)}::int[],
        ${uniqueSpots.map((s) => s.capacity)}::int[],
        ${uniqueSpots.map((s) => s.sheltered)}::boolean[],
        ${uniqueSpots.map((s) => s.parkingType)}::text[],
        ${uniqueSpots.map((s) => s.sourceType)}::text[]
      ) AS t(
        uniqueid,
        name,
        lng,
        lat,
        occupancy,
        capacity,
        sheltered,
        racktype,
        type
      )
      ON CONFLICT (uniqueid) DO UPDATE SET
        occupancy = EXCLUDED.occupancy,
        capacity = EXCLUDED.capacity,
        sheltered = EXCLUDED.sheltered,
        name = EXCLUDED.name,
        racktype = EXCLUDED.racktype,
        type = EXCLUDED.type;
      `;

    await sql`
      INSERT INTO map_tiles (tile_id, center, fetched, last_fetched)
      VALUES (
        ${tileId},
        ST_SetSRID(ST_MakePoint(${centerLng}, ${centerLat}), 4326)::geography,
        true,
        NOW()
      )
      ON CONFLICT (tile_id) DO UPDATE SET
        center = EXCLUDED.center,
        fetched = true,
        last_fetched = NOW();
    `;

    return NextResponse.json(
      { success: true, upsertedCount: uniqueSpots.length, tileId },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update DB spots",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
