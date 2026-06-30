export default interface ParkingSpotApiResponse {
  Description: string;
  Latitude: number;
  Longitude: number;
  SpotType: string;
  SpotCount: number;
  ShelterIndicator: "Y" | "N";
}
