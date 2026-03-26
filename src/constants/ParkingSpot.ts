export interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sheltered: boolean;
  rackType: string;
  sourceType: "official" | "community";
  capacity: number;
  occupancy: number;
}
