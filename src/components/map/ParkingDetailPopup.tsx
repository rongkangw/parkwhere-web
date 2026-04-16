import { Popup } from "react-map-gl/maplibre";
import { Umbrella, UmbrellaOff } from "lucide-react";
import { POPUP_ANCHOR, POPUP_OFFSET } from "@/core/constants/map/MapConstants";
import ParkingSpot from "@/core/constants/ParkingSpot";
import PopupSourceTag from "@/components/map/PopupSourceTag";

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
      <div className="min-w-50 border-gray-300 bg-white px-2 text-[#5686E1]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-3xs text-lg font-bold">{rack.name}</div>
          <div className="flex items-center gap-2">
            <PopupSourceTag sourceType={rack.sourceType} />
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border shadow-sm ${
                rack.sheltered
                  ? "border-sky-500 bg-gray-100"
                  : "border-gray-300 bg-gray-100"
              }`}
            >
              {rack.sheltered ? (
                <Umbrella className="text-sky-500" size={16} />
              ) : (
                <UmbrellaOff className="text-gray-500" size={16} />
              )}
            </div>
          </div>
        </div>
        <div className="mt-1 text-base">Capacity: {rack.capacity}</div>
        <div className="mt-1 text-base">
          Type: {rack.parkingType == "" ? "Unknown" : rack.parkingType}
        </div>
      </div>
    </Popup>
  );
}
