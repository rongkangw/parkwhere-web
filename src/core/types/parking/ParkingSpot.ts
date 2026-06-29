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
