"use server";

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import ParkingSpot from "@/core/types/parking/ParkingSpot";
import createParkingSpotId from "@/utils/parking/createParkingSpotId";

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
        spots.map((spot) => [createParkingSpotId(spot.lat, spot.lng), spot]),
      ).values(),
    );

    const normalizedSpots = uniqueSpots.map((spot) => ({
      ...spot,
      name: spot.name ?? "",
      capacity: Number(spot.capacity ?? 0),
      sheltered: Boolean(spot.sheltered),
      parkingType: spot.parkingType ?? "",
      sourceType: spot.sourceType ?? "official",
      upvotes: Number(spot.upvotes ?? 0),
      downvotes: Number(spot.downvotes ?? 0),
      status: spot.status ?? "none",
    }));

    // Upsert all spots into the DB
    // On conflict, update the existing record with new values, but preserve upvotes/downvotes if they are non-zero
    await sql`
      INSERT INTO parking_spots (
        uniqueid,
        name,
        location,
        capacity,
        sheltered,
        racktype,
        type,
        upvotes,
        downvotes,
        status,
        last_seen_at,
        is_active
      )
      SELECT
        t.uniqueid,
        t.name,
        ST_SetSRID(ST_MakePoint(t.lng, t.lat), 4326)::geography,
        t.capacity,
        t.sheltered,
        t.racktype,
        t.type,
        t.upvotes,
        t.downvotes,
        t.status,
        NOW(),
        TRUE
      FROM UNNEST(
        ${normalizedSpots.map((s) => createParkingSpotId(s.lat, s.lng))}::text[],
        ${normalizedSpots.map((s) => s.name)}::text[],
        ${normalizedSpots.map((s) => s.lng)}::float8[],
        ${normalizedSpots.map((s) => s.lat)}::float8[],
        ${normalizedSpots.map((s) => s.capacity)}::int[],
        ${normalizedSpots.map((s) => s.sheltered)}::boolean[],
        ${normalizedSpots.map((s) => s.parkingType)}::text[],
        ${normalizedSpots.map((s) => s.sourceType)}::text[],
        ${normalizedSpots.map((s) => s.upvotes)}::int[],
        ${normalizedSpots.map((s) => s.downvotes)}::int[],
        ${normalizedSpots.map((s) => s.status)}::text[]
      ) AS t(
        uniqueid,
        name,
        lng,
        lat,
        capacity,
        sheltered,
        racktype,
        type,
        upvotes,
        downvotes,
        status
      )
      ON CONFLICT (uniqueid) DO UPDATE SET
        capacity = EXCLUDED.capacity,
        sheltered = EXCLUDED.sheltered,
        name = EXCLUDED.name,
        racktype = EXCLUDED.racktype,
        type = EXCLUDED.type,
        upvotes = CASE
          WHEN parking_spots.upvotes <> 0 THEN parking_spots.upvotes
          ELSE EXCLUDED.upvotes
        END,
        downvotes = CASE
          WHEN parking_spots.downvotes <> 0 THEN parking_spots.downvotes
          ELSE EXCLUDED.downvotes
        END,
        status = CASE
          WHEN parking_spots.status <> 'none' THEN parking_spots.status
          ELSE EXCLUDED.status
        END,
        last_seen_at = NOW(),
        is_active = TRUE;
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
      { success: true, upsertedCount: normalizedSpots.length, tileId },
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
