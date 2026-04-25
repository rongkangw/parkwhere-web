export default interface ParkingSpotApiResponse {
  Description: string;
  Latitude: number;
  Longitude: number;
  RackType: string;
  RackCount: number;
  ShelterIndicator: "Y" | "N";
}
