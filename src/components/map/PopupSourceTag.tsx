import { ParkingSpot } from "@/constants/ParkingSpot";

interface SourceTypeBadgeProps {
  sourceType: ParkingSpot["sourceType"];
}

export default function PopupSourceTag({ sourceType }: SourceTypeBadgeProps) {
  const isOfficial = sourceType === "official";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        fontSize: "0.75rem",
        fontWeight: 600,
        lineHeight: 1.2,
        textTransform: "capitalize",
        borderRadius: 9999,
        backgroundColor: "#ffffff",
        border: `1px solid ${isOfficial ? "#16a34a" : "#eab308"}`,
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.12)",
      }}
    >
      {isOfficial ? "Official" : "Community"}
    </span>
  );
}
