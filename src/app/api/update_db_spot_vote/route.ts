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
  vote: VoteDirection | null;
};

type DbVoteRow = {
  upvotes: number;
  downvotes: number;
  user_vote: VoteDirection | null;
};

export async function POST(request: NextRequest) {
  let body: VoteParkingSpotRequest;

  try {
    body = (await request.json()) as VoteParkingSpotRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { spotId, vote } = body;
  if (!spotId || (vote !== "up" && vote !== "down" && vote !== null)) {
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

  try {
    const voteMutation =
      vote === null
        ? sql`
            DELETE FROM parking_spot_votes
            WHERE user_id = ${userId}
              AND spot_id = ${spotId};
          `
        : sql`
            INSERT INTO parking_spot_votes (user_id, spot_id, vote)
            SELECT ${userId}, ${spotId}, ${vote === "up" ? 1 : -1}
            WHERE EXISTS (
              SELECT 1
              FROM parking_spots
              WHERE uniqueid = ${spotId}
            )
            ON CONFLICT (user_id, spot_id)
            DO UPDATE SET
              vote = EXCLUDED.vote,
              updated_at = NOW();
          `;

    const [, dbVoteRows] = await sql.transaction([
      voteMutation,
      sql`
        UPDATE parking_spots
        SET
          upvotes = (
            SELECT COUNT(*)::int
            FROM parking_spot_votes
            WHERE spot_id = ${spotId}
              AND vote = 1
          ),
          downvotes = (
            SELECT COUNT(*)::int
            FROM parking_spot_votes
            WHERE spot_id = ${spotId}
              AND vote = -1
          )
        WHERE uniqueid = ${spotId}
        RETURNING
          upvotes,
          downvotes,
          ${vote}::text AS user_vote;
      `,
    ]);
    const [dbVoteRow] = dbVoteRows as DbVoteRow[];

    if (!dbVoteRow) {
      return NextResponse.json(
        { error: "Parking spot not found" },
        { status: 404 },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        spotId,
        upvotes: dbVoteRow.upvotes,
        downvotes: dbVoteRow.downvotes,
        userVote: dbVoteRow.user_vote,
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
