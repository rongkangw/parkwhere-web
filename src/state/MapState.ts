import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/MapConstants";
import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";
import { create } from "zustand";

interface MapState {
  selectedRack: ParkingSpotResponse | null; // store whole parking spot object for easier access in popup
  cameraLatitude: number;
  cameraLongitude: number;
  setSelectedRack: (id: ParkingSpotResponse | null) => void;
  setCameraLocation: (latitude: number, longitude: number) => void;
}

export const useMapStore = create<MapState>((set) => ({
  selectedRack: null,
  cameraLatitude: DEFAULT_LATITUDE,
  cameraLongitude: DEFAULT_LONGITUDE,
  setSelectedRack: (rack) => set({ selectedRack: rack }),
  setCameraLocation: (latitude, longitude) =>
    set({ cameraLatitude: latitude, cameraLongitude: longitude }),
}));
