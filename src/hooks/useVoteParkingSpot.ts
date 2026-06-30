import { useCallback } from "react";
import updateParkingSpotVote from "@/services/db/updateDbSpotVote";
import { saveLocalUserVotes } from "@/services/local/fetchLocalSpotVote";
import type {
  LocalParkingSpotVoteCounts,
  LocalUserVotes,
  ParkingSpotVoteCounts,
  VoteDirection,
} from "@/core/types/parking/ParkingSpot";

type UseVoteParkingSpotArgs = {
  setLocalParkingSpotVoteCounts: React.Dispatch<
    React.SetStateAction<LocalParkingSpotVoteCounts>
  >;
  setLocalUserVotes: React.Dispatch<React.SetStateAction<LocalUserVotes>>;
  addMapError: (message: string) => void;
};

type VoteArgs = {
  spotId: string;
  submittedVote: VoteDirection | null;
  previousVote: VoteDirection | null;
  previousCounts: ParkingSpotVoteCounts;
};

function calculateOptimisticVoteCounts({
  previousCounts,
  previousVote,
  nextVote,
}: Pick<
  VoteArgs,
  "previousCounts" | "previousVote"
> & {
  nextVote: VoteDirection | null;
}): ParkingSpotVoteCounts {
  const optimisticCounts = {
    upvotes: previousCounts.upvotes,
    downvotes: previousCounts.downvotes,
  };

  if (previousVote === "up") {
    optimisticCounts.upvotes -= 1;
  }

  if (previousVote === "down") {
    optimisticCounts.downvotes -= 1;
  }

  if (nextVote === "up") {
    optimisticCounts.upvotes += 1;
  }

  if (nextVote === "down") {
    optimisticCounts.downvotes += 1;
  }

  return {
    upvotes: Math.max(0, optimisticCounts.upvotes),
    downvotes: Math.max(0, optimisticCounts.downvotes),
  };
}

function setLocalUserVoteForSpot(
  localUserVotes: LocalUserVotes,
  spotId: string,
  vote: VoteDirection | null,
): LocalUserVotes {
  const nextLocalUserVotes = { ...localUserVotes };

  if (vote) {
    nextLocalUserVotes[spotId] = vote;
  } else {
    delete nextLocalUserVotes[spotId];
  }

  return nextLocalUserVotes;
}

export default function useVoteParkingSpot({
  setLocalParkingSpotVoteCounts,
  setLocalUserVotes,
  addMapError,
}: UseVoteParkingSpotArgs) {
  const vote = useCallback(
    ({ spotId, submittedVote, previousVote, previousCounts }: VoteArgs) => {
      // Optimistically update the UI while the DB request is in flight.
      const optimisticCounts = calculateOptimisticVoteCounts({
        previousCounts,
        previousVote,
        nextVote: submittedVote,
      });

      setLocalParkingSpotVoteCounts((current) => ({
        ...current,
        [spotId]: optimisticCounts,
      }));

      setLocalUserVotes((current) =>
        setLocalUserVoteForSpot(current, spotId, submittedVote),
      );

      void (async () => {
        try {
          const dbVoteResult = await updateParkingSpotVote(
            spotId,
            submittedVote,
          );

          setLocalParkingSpotVoteCounts((current) => ({
            ...current,
            [spotId]: {
              upvotes: dbVoteResult.dbUpvotes,
              downvotes: dbVoteResult.dbDownvotes,
            },
          }));

          setLocalUserVotes((current) => {
            const nextLocalUserVotes = setLocalUserVoteForSpot(
              current,
              spotId,
              dbVoteResult.dbUserVote,
            );
            saveLocalUserVotes(nextLocalUserVotes);
            return nextLocalUserVotes;
          });
        } catch (error) {
          setLocalParkingSpotVoteCounts((current) => ({
            ...current,
            [spotId]: previousCounts,
          }));

          setLocalUserVotes((current) =>
            setLocalUserVoteForSpot(current, spotId, previousVote),
          );

          addMapError(
            error instanceof Error ? error.message : "Failed to submit vote.",
          );
        }
      })();
    },
    [setLocalParkingSpotVoteCounts, setLocalUserVotes, addMapError],
  );

  return { vote };
}
