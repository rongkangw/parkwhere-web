export interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity?: number;
  sheltered?: boolean;
  type: "official" | "community";
}
