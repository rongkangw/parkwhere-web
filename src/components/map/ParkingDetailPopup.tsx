import { Popup } from "react-map-gl/maplibre";
import {
  ArrowBigLeft,
  Flag,
  Navigation,
  Umbrella,
  UmbrellaOff,
} from "lucide-react";
import ParkingSpot from "@/core/types/parking/ParkingSpot";
import PopupSourceTag from "@/components/map/PopupSourceTag";

interface BikeParkingPopupProps {
  rack: ParkingSpot;
  onUpvote: (rackId: string) => void;
  onDownvote: (rackId: string) => void;
  currentVote: "up" | "down" | null;
  onClose: () => void;
  onFlag: () => void;
  onNavigate: (rack: ParkingSpot) => void;
}

export default function BikeParkingPopup({
  rack,
  onUpvote,
  onDownvote,
  currentVote,
  onClose,
  onFlag,
  onNavigate,
}: BikeParkingPopupProps) {
  return (
    <Popup
      longitude={rack.lng}
      latitude={rack.lat}
      anchor={"left"}
      closeOnClick={false}
      onClose={onClose}
      offset={12}
    >
      <div className="min-w-50 border-gray-300 bg-white px-2 text-[#5686E1]">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-3xs text-lg font-bold">{rack.name}</div>
          <div className="flex items-center gap-2">
            <PopupSourceTag sourceType={rack.sourceType} />
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full border ${
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
            {rack.status != "none" && (
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border ${
                  rack.status === "missing"
                    ? "border-amber-500 bg-gray-100"
                    : rack.status === "full"
                      ? "border-rose-500 bg-gray-100"
                      : "border-gray-300 bg-gray-100"
                }`}
              ></div>
            )}
            <button
              type="button"
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-100 shadow-sm hover:bg-gray-200"
              onClick={() => onFlag()}
            >
              <Flag size={16} />
            </button>
          </div>
        </div>
        <div className="mt-1 text-base">Capacity: {rack.capacity}</div>
        <div className="mt-1 text-base">
          Type: {rack.parkingType == "" ? "Unknown" : rack.parkingType}
        </div>
        <div className="mt-1 flex justify-between gap-2">
          <div className="mt-1 text-base">Rate this parking spot:</div>
          <div className="flex items-center gap-2">
            <button
              className={`flex h-7 w-7 items-center justify-center rounded-full border ${currentVote === "up" ? "border-sky-500 bg-sky-100 text-sky-700" : ""}`}
              type="button"
              onClick={() => onUpvote(rack.id)}
            >
              <ArrowBigLeft className="rotate-90" size={16} />
            </button>
            <div className="mt-1 text-base">{rack.upvotes}</div>
            <button
              className={`flex h-7 w-7 items-center justify-center rounded-full border ${currentVote === "down" ? "border-rose-500 bg-rose-100 text-rose-700" : ""}`}
              type="button"
              onClick={() => onDownvote(rack.id)}
            >
              <ArrowBigLeft className="rotate-270" size={16} />
            </button>
            <div className="mt-1 text-base">{rack.downvotes}</div>
          </div>
        </div>
        <button
          type="button"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-400"
          onClick={() => onNavigate(rack)}
        >
          <Navigation size={16} />
          Navigate
        </button>
      </div>
    </Popup>
  );
}
