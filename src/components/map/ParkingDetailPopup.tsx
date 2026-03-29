import { Popup } from "react-map-gl/maplibre";
import {
  POPUP_ANCHOR,
  POPUP_MIN_WIDTH,
  POPUP_OFFSET,
  POPUP_TEXT_COLOR,
} from "@/core/constants/map/MapConstants";
import ParkingSpot from "@/core/constants/ParkingSpot";
import PopupSourceTag from "@/components/map/PopupSourceTag";
import PopupOccupancyBar from "@/components/map/PopupOccupancyBar";

interface BikeParkingPopupProps {
  rack: ParkingSpot;
  onClose: () => void;
}

export default function BikeParkingPopup({
  rack,
  onClose,
}: BikeParkingPopupProps) {
  return (
    <Popup
      longitude={rack.lng}
      latitude={rack.lat}
      anchor={POPUP_ANCHOR}
      closeOnClick={false}
      onClose={onClose}
      offset={POPUP_OFFSET}
    >
      <div style={{ minWidth: POPUP_MIN_WIDTH, color: POPUP_TEXT_COLOR }}>
        <div className="flex items-center gap-2">
          <div className="font-semibold">{rack.name}</div>
          <PopupSourceTag sourceType={rack.sourceType} />
        </div>
        <PopupOccupancyBar
          occupancy={rack.occupancy}
          capacity={rack.capacity}
        />
        <div className="mt-1">Type: {rack.parkingType}</div>
        <div>Shelter: {rack.sheltered ? "Yes" : "No"}</div>
      </div>
    </Popup>
  );
}
