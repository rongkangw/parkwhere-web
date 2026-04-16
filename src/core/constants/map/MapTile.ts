import ParkingSpot from "@/core/constants/ParkingSpot";

export default interface MapTile {
  tileId: string;
  lat: number;
  lng: number;
  shouldPersist: boolean;
  spots?: ParkingSpot[];
}
