interface PopupOccupancyBarProps {
  capacity: number;
}

export default function PopupOccupancyBar({
  capacity,
}: PopupOccupancyBarProps) {
  return (
    <div className="mt-1 text-sm text-slate-700">Capacity: {capacity}</div>
  );
}
