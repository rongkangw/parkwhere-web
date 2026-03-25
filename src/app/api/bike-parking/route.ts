import { NextRequest, NextResponse } from "next/server";

const DATAMALL_URL =
  "https://datamall2.mytransport.sg/ltaodataservice/BicycleParkingv2";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const dist = searchParams.get("dist") ?? "0.5";

  if (!lat || !lng) {
    return NextResponse.json(
      { error: "Missing required query params: lat and lng" },
      { status: 400 },
    );
  }

  const accountKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!accountKey) {
    return NextResponse.json(
      { error: "Missing LTA account key" },
      { status: 500 },
    );
  }

  const externalUrl = `${DATAMALL_URL}?Lat=${encodeURIComponent(lat)}&Long=${encodeURIComponent(lng)}&Dist=${encodeURIComponent(dist)}`;

  try {
    const res = await fetch(externalUrl, {
      headers: {
        AccountKey: accountKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Datamall", detail: data },
        { status: res.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while fetching bike parking data" },
      { status: 500 },
    );
  }
}
