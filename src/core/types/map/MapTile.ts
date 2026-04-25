import ParkingSpot from "@/core/types/parking/ParkingSpot";

export default interface MapTile {
  tileId: string;
  lat: number;
  lng: number;
  shouldPersist: boolean;
  spots?: ParkingSpot[];
}
