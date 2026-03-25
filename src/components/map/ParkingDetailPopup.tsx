import { Popup } from "react-map-gl/maplibre";
import type { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";
import {
  POPUP_ANCHOR,
  POPUP_MIN_WIDTH,
  POPUP_OFFSET,
  POPUP_TEXT_COLOR,
} from "@/constants/MapConstants";

interface BikeParkingPopupProps {
  rack: ParkingSpotResponse;
  onClose: () => void;
}

export default function BikeParkingPopup({
  rack,
  onClose,
}: BikeParkingPopupProps) {
  return (
    <Popup
      longitude={rack.Longitude}
      latitude={rack.Latitude}
      anchor={POPUP_ANCHOR}
      closeOnClick={false}
      onClose={onClose}
      offset={POPUP_OFFSET}
    >
      <div style={{ minWidth: POPUP_MIN_WIDTH, color: POPUP_TEXT_COLOR }}>
        <div style={{ fontWeight: 600 }}>{rack.Description}</div>
        <div>Rack count: {rack.RackCount}</div>
        <div>Rack type: {rack.RackType}</div>
        <div>Shelter: {rack.ShelterIndicator === "Y" ? "Yes" : "No"}</div>
      </div>
    </Popup>
  );
}
