export default interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sheltered: boolean;
  parkingType: string;
  sourceType: "official" | "community";
  capacity: number;
  upvotes: number;
  downvotes: number;
  status: "full" | "missing" | "none";
}

export type VoteDirection = "up" | "down";
export type LocalUserVotes = Record<string, VoteDirection>;
export type ParkingSpotVoteCounts = Pick<
  ParkingSpot,
  "upvotes" | "downvotes"
>;
export type LocalParkingSpotVoteCounts = Record<
  string,
  ParkingSpotVoteCounts
>;
