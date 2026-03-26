interface PopupOccupancyBarProps {
  occupancy: number;
  capacity: number;
}

export default function PopupOccupancyBar({
  occupancy,
  capacity,
}: PopupOccupancyBarProps) {
  const occupancyPercent =
    capacity > 0 ? Math.max(0, Math.min(100, (occupancy / capacity) * 100)) : 0;

  return (
    <div>
      <div style={{ marginBottom: 4 }}>
        Occupancy: {occupancy} / {capacity}
      </div>
      <div
        style={{
          width: "100%",
          height: 8,
          borderRadius: 9999,
          backgroundColor: "#e2e8f0",
          overflow: "hidden",
          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.08)",
        }}
        aria-label={`Parking occupancy ${Math.round(occupancyPercent)} percent`}
      >
        <div
          style={{
            width: `${occupancyPercent}%`,
            height: "100%",
            backgroundColor: "#22c55e",
            transition: "width 240ms ease",
          }}
        />
      </div>
    </div>
  );
}
