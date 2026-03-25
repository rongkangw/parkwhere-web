export interface ParkingSpotResponse {
  Description: string;
  Latitude: number;
  Longitude: number;
  RackType: string;
  RackCount: number;
  ShelterIndicator: "Y" | "N";
}
