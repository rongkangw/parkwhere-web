export default interface ParkingSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sheltered: boolean;
  parkingType: string;
  sourceType: "official" | "community";
  capacity: number;
  occupancy: number;
}
