"use server";

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import {
  VOTE_SESSION_COOKIE,
  VOTE_SESSION_MAX_AGE,
} from "@/core/constants/ApiConstants";
import { VoteDirection } from "@/core/types/parking/ParkingSpot";

type VoteParkingSpotRequest = {
  spotId: string;
  vote: VoteDirection;
};

type VoteRow = {
  upvotes: number;
  downvotes: number;
  user_vote: VoteDirection;
};

export async function POST(request: NextRequest) {
  let body: VoteParkingSpotRequest;

  try {
    body = (await request.json()) as VoteParkingSpotRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { spotId, vote } = body;
  if (!spotId || (vote !== "up" && vote !== "down")) {
    return NextResponse.json(
      { error: "Invalid body. Required: spotId, vote" },
      { status: 400 },
    );
  }

  const existingSessionId = request.cookies.get(VOTE_SESSION_COOKIE)?.value;
  const userId = existingSessionId ?? crypto.randomUUID();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json(
      { error: "Missing DATABASE_URL" },
      { status: 500 },
    );
  }

  const sql = neon(databaseUrl);
  const voteValue = vote === "up" ? 1 : -1;

  try {
    const [spot] = (await sql`
      WITH current_vote AS (
        SELECT vote
        FROM parking_spot_votes
        WHERE user_id = ${userId}
          AND spot_id = ${spotId}
      ),
      upsert_vote AS (
        INSERT INTO parking_spot_votes (user_id, spot_id, vote)
        VALUES (${userId}, ${spotId}, ${voteValue})
        ON CONFLICT (user_id, spot_id)
        DO UPDATE SET vote = EXCLUDED.vote
        RETURNING vote
      ),
      updated_spot AS (
        UPDATE parking_spots
        SET
          upvotes = upvotes + CASE
            WHEN (SELECT vote FROM current_vote) IS NULL AND ${voteValue} = 1 THEN 1
            WHEN (SELECT vote FROM current_vote) = -1 AND ${voteValue} = 1 THEN 1
            WHEN (SELECT vote FROM current_vote) = 1 AND ${voteValue} = -1 THEN -1
            ELSE 0
          END,
          downvotes = downvotes + CASE
            WHEN (SELECT vote FROM current_vote) IS NULL AND ${voteValue} = -1 THEN 1
            WHEN (SELECT vote FROM current_vote) = 1 AND ${voteValue} = -1 THEN 1
            WHEN (SELECT vote FROM current_vote) = -1 AND ${voteValue} = 1 THEN -1
            ELSE 0
          END
        WHERE uniqueid = ${spotId}
        RETURNING upvotes, downvotes
      )
      SELECT
        COALESCE((SELECT upvotes FROM updated_spot), parking_spots.upvotes) AS upvotes,
        COALESCE((SELECT downvotes FROM updated_spot), parking_spots.downvotes) AS downvotes,
        (SELECT vote FROM upsert_vote) AS user_vote
      FROM parking_spots
      WHERE uniqueid = ${spotId};
    `) as VoteRow[];

    if (!spot) {
      return NextResponse.json(
        { error: "Parking spot not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        spotId,
        upvotes: spot.upvotes,
        downvotes: spot.downvotes,
        userVote: vote === "up" ? "up" : "down",
      },
      { status: 200 },
    );

    if (!existingSessionId) {
      response.cookies.set({
        name: VOTE_SESSION_COOKIE,
        value: userId,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: VOTE_SESSION_MAX_AGE,
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to submit vote",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
