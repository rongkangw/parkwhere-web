import { useCallback } from "react";
import updateParkingSpotVote from "@/services/db/updateDbSpotVote";
import { saveVoteState } from "@/services/local/fetchLocalSpotVote";
import type { VoteDirection } from "@/core/types/parking/ParkingSpot";

type UseVoteParkingSpotArgs = {
  setVoteCountOverrides: React.Dispatch<
    React.SetStateAction<Record<string, { upvotes: number; downvotes: number }>>
  >;
  setVoteStateBySpotId: React.Dispatch<
    React.SetStateAction<Record<string, VoteDirection>>
  >;
  addMapError: (message: string) => void;
};

export default function useVoteParkingSpot({
  setVoteCountOverrides,
  setVoteStateBySpotId,
  addMapError,
}: UseVoteParkingSpotArgs) {
  const vote = useCallback(
    (spotId: string, voteChoice: VoteDirection) => {
      void (async () => {
        try {
          const result = await updateParkingSpotVote(spotId, voteChoice);

          setVoteCountOverrides((current) => ({
            ...current,
            [spotId]: {
              upvotes: result.upvotes,
              downvotes: result.downvotes,
            },
          }));

          setVoteStateBySpotId((current) => {
            const next = { ...current, [spotId]: result.userVote };
            saveVoteState(next);
            return next;
          });
        } catch (error) {
          addMapError(
            error instanceof Error ? error.message : "Failed to submit vote.",
          );
        }
      })();
    },
    [setVoteCountOverrides, setVoteStateBySpotId, addMapError],
  );

  return { vote };
}
