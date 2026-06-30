import { LOCAL_USER_VOTES_KEY } from "@/core/constants/ApiConstants";
import type {
  LocalUserVotes,
  VoteDirection,
} from "@/core/types/parking/ParkingSpot";

export function loadLocalUserVotes(): LocalUserVotes {
  if (typeof window === "undefined") {
    return {};
  }

  const rawState = window.localStorage.getItem(LOCAL_USER_VOTES_KEY);
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

export function saveLocalUserVotes(localUserVotes: LocalUserVotes): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    LOCAL_USER_VOTES_KEY,
    JSON.stringify(localUserVotes),
  );
}
