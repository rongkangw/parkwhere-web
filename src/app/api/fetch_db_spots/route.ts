"use server";

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

type DbRackRow = {
  uniqueid: string;
  name: string;
  capacity: number;
  sheltered: boolean;
  racktype: string;
  type: string;
  lat: number;
  lng: number;
  upvotes: number;
  downvotes: number;
  status: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const distParam = searchParams.get("dist") ?? "500";

  if (!latParam || !lngParam) {
    return NextResponse.json(
      { error: "Missing required query params: lat and lng" },
      { status: 400 },
    );
  }

  const lat = Number(latParam);
  const lng = Number(lngParam);
  const dist = Number(distParam);

  if ([lat, lng, dist].some((value) => Number.isNaN(value))) {
    return NextResponse.json(
      { error: "Invalid query params. lat, lng, and dist must be numbers." },
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
    const rows = (await sql`
      SELECT
          uniqueid,
          name,
          capacity,
          sheltered,
          racktype,
          upvotes,
          downvotes,
          status,
          type,
          ST_Y(location::geometry) AS lat,
          ST_X(location::geometry) AS lng
      FROM parking_spots
      WHERE is_active
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${dist}
      );
    `) as DbRackRow[];

    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch parking spots from database",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
