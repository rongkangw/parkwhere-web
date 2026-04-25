import ParkingSpot from "@/core/types/parking/ParkingSpot";

export default interface MapState {
  selectedRack: ParkingSpot | null; // store whole parking spot object for easier access in popup
  cameraLatitude: number;
  cameraLongitude: number;
  setSelectedRack: (id: ParkingSpot | null) => void;
  setCameraLocation: (latitude: number, longitude: number) => void;
}
