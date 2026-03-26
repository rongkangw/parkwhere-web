import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/constants/MapConstants";
import { create } from "zustand";
import MapState from "@/state/MapState";

export const useMapStore = create<MapState>((set) => ({
  selectedRack: null,
  cameraLatitude: DEFAULT_LATITUDE,
  cameraLongitude: DEFAULT_LONGITUDE,
  setSelectedRack: (rack) => set({ selectedRack: rack }),
  setCameraLocation: (latitude, longitude) =>
    set({ cameraLatitude: latitude, cameraLongitude: longitude }),
}));
