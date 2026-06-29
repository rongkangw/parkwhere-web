export default interface ParkingSpotDbResponse {
  uniqueid: string;
  name: string;
  lat: number;
  lng: number;
  sheltered: boolean;
  parkingtype: string;
  sourcetype: string;
  capacity: number;
  upvotes: number;
  downvotes: number;
  status: string;
}
