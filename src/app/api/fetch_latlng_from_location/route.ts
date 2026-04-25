"use server";

import {
  TOKEN_REFRESH_BUFFER_MS,
  ONEMAP_AUTH_URL,
  ONEMAP_GEOCODE_URL,
} from "@/core/constants/api/OneMapApiConstants";
import { NextRequest, NextResponse } from "next/server";

type OneMapAuthResponse = {
  access_token?: string;
  expiry_timestamp?: string;
  error?: string;
};

let cachedToken: string | null = null;
let cachedTokenExpiryMs = 0;

async function getOneMapToken(): Promise<string> {
  const now = Date.now();
  if (cachedToken && now < cachedTokenExpiryMs - TOKEN_REFRESH_BUFFER_MS) {
    console.log("Using cached OneMap token");
    return cachedToken;
  }

  const accountEmail = process.env.ONEMAP_EMAIL;
  const accountPassword = process.env.ONEMAP_PASSWORD;

  if (!accountEmail || !accountPassword) {
    throw new Error("Missing ONEMAP_EMAIL or ONEMAP_PASSWORD");
  }

  const authRes = await fetch(ONEMAP_AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: accountEmail,
      password: accountPassword,
    }),
    cache: "no-store",
  });

  const authData = (await authRes.json()) as OneMapAuthResponse;
  if (!authRes.ok || !authData.access_token) {
    throw new Error(
      `Failed to authenticate OneMap API (${authRes.status}): ${authData.error ?? "No token in response"}`,
    );
  }

  cachedToken = authData.access_token;

  if (authData.expiry_timestamp) {
    const expirySeconds = Number(authData.expiry_timestamp);
    cachedTokenExpiryMs = Number.isFinite(expirySeconds)
      ? expirySeconds * 1000
      : now + 3 * 24 * 60 * 60 * 1000;
  } else {
    cachedTokenExpiryMs = now + 3 * 24 * 60 * 60 * 1000;
  }

  return cachedToken;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const searchVal = searchParams.get("searchVal");
  const returnGeom = searchParams.get("returnGeom");
  const getAddrDetails = searchParams.get("getAddrDetails");
  const pageNum = searchParams.get("pageNum");

  if (!searchVal || !returnGeom || !getAddrDetails || !pageNum) {
    return NextResponse.json(
      {
        error:
          "Missing one or more required queries: searchVal, returnGeom, getAddrDetails, pageNum",
      },
      { status: 400 },
    );
  }

  if (
    !["Y", "N"].includes(returnGeom) ||
    !["Y", "N"].includes(getAddrDetails)
  ) {
    return NextResponse.json(
      {
        error: "returnGeom and getAddrDetails must be Y or N",
      },
      { status: 400 },
    );
  }

  const parsedPageNum = Number(pageNum);
  if (!Number.isInteger(parsedPageNum) || parsedPageNum < 1) {
    return NextResponse.json(
      { error: "pageNum must be a positive integer" },
      { status: 400 },
    );
  }

  try {
    const token = await getOneMapToken();

    const geocodeParams = new URLSearchParams({
      searchVal,
      returnGeom,
      getAddrDetails,
      pageNum: String(parsedPageNum),
    });

    const geocodeRes = await fetch(
      `${ONEMAP_GEOCODE_URL}?${geocodeParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: token,
        },
        cache: "no-store",
      },
    );

    const geocodeData = await geocodeRes.json();

    if (!geocodeRes.ok) {
      return NextResponse.json(
        {
          error: geocodeData,
        },
        { status: geocodeRes.status },
      );
    }

    return NextResponse.json(geocodeData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
