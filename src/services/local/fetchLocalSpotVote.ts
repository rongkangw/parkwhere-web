import { VOTE_STATE_KEY } from "@/core/constants/ApiConstants";
import { VoteDirection } from "@/core/types/parking/ParkingSpot";

export function loadVoteState(): Record<string, VoteDirection> {
  if (typeof window === "undefined") {
    return {};
  }

  const rawState = window.localStorage.getItem(VOTE_STATE_KEY);
  if (!rawState) {
    return {};
  }

  try {
    const parsed = JSON.parse(rawState) as Record<string, VoteDirection>;
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([, vote]) =>
          typeof vote === "string" && (vote === "up" || vote === "down"),
      ),
    );
  } catch {
    return {};
  }
}

export function saveVoteState(
  voteStateBySpotId: Record<string, VoteDirection>,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    VOTE_STATE_KEY,
    JSON.stringify(voteStateBySpotId),
  );
}
