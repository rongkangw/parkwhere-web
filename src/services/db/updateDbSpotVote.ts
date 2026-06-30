import { VoteDirection } from "@/core/types/parking/ParkingSpot";

type UpdateDbSpotVotePayload = {
  spotId: string;
  vote: VoteDirection | null;
};

type UpdateDbSpotVoteResponse = {
  success: boolean;
  spotId: string;
  upvotes: number;
  downvotes: number;
  userVote: VoteDirection | null;
};

type UpdateDbSpotVoteResult = {
  success: boolean;
  spotId: string;
  dbUpvotes: number;
  dbDownvotes: number;
  dbUserVote: VoteDirection | null;
};

export default async function updateParkingSpotVote(
  spotId: string,
  vote: VoteDirection | null,
): Promise<UpdateDbSpotVoteResult> {
  const payload: UpdateDbSpotVotePayload = {
    spotId,
    vote,
  };

  const response = await fetch("/api/update_db_spot_vote", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as Partial<UpdateDbSpotVoteResponse> & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to submit vote");
  }

  if (
    typeof data.upvotes !== "number" ||
    typeof data.downvotes !== "number" ||
    (data.userVote !== "up" &&
      data.userVote !== "down" &&
      data.userVote !== null) ||
    typeof data.spotId !== "string"
  ) {
    throw new Error("Vote response was incomplete");
  }

  return {
    success: true,
    spotId: data.spotId,
    dbUpvotes: data.upvotes,
    dbDownvotes: data.downvotes,
    dbUserVote: data.userVote,
  };
}
