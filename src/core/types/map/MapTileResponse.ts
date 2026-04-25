export default interface MapTileResponse {
  tileId: string;
  lat: number;
  lng: number;
  fetched: boolean;
  lastFetched: Date | null;
}
