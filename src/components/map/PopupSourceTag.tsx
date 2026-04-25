import ParkingSpot from "@/core/constants/parkingspot/ParkingSpot";

interface SourceTypeBadgeProps {
  sourceType: ParkingSpot["sourceType"];
}

export default function PopupSourceTag({ sourceType }: SourceTypeBadgeProps) {
  const isOfficial = sourceType === "official";

  return (
    <span
      className={`inline-flex items-center rounded-full border bg-white px-2 py-0.5 text-xs leading-[1.2] font-semibold capitalize shadow-sm ${
        isOfficial ? "border-green-600" : "border-amber-500"
      }`}
    >
      {isOfficial ? "Official" : "Community"}
    </span>
  );
}
