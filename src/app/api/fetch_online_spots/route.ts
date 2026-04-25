"use server";

import {
  DATAMALL_URL,
  MISSING_LATLNG_ERROR,
  MISSING_LTA_KEY_ERROR,
} from "@/core/constants/api/LtaApiConstants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const dist = searchParams.get("dist") ?? "0.5";

  if (!lat || !lng) {
    return NextResponse.json({ error: MISSING_LATLNG_ERROR }, { status: 400 });
  }

  const accountKey = process.env.LTA_PARKINGSPOT_API_KEY;

  if (!accountKey) {
    return NextResponse.json({ error: MISSING_LTA_KEY_ERROR }, { status: 400 });
  }

  const url = `${DATAMALL_URL}?Lat=${encodeURIComponent(lat)}&Long=${encodeURIComponent(lng)}&Dist=${encodeURIComponent(dist)}`;

  try {
    const res = await fetch(url, {
      headers: {
        AccountKey: accountKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: res.status });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
