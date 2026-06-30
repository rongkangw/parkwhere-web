import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPinOff,
  Umbrella,
  UmbrellaOff,
} from "lucide-react";
import ParkingSpot from "@/core/types/parking/ParkingSpot";

type NearestSpotsSidebarProps = {
  spots: Array<ParkingSpot & { distance: number }>;
  hasUserLocation: boolean;
  onSelectSpot: (spot: ParkingSpot) => void;
};

export default function NearestSpotsSidebar({
  spots,
  hasUserLocation,
  onSelectSpot,
}: NearestSpotsSidebarProps) {
  const hasParkingSpots = spots.length > 0;
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsExpanded((current) => !current)}
        className="ui-floating-btn fixed top-4 left-0 z-40 ml-0.5 flex h-9 w-9 items-center justify-center p-0"
        style={{
          left: isExpanded ? "calc(20rem + 0.25rem)" : "0.125rem",
          transition: "left 300ms ease-in-out",
        }}
        aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      <div
        className="ui-floating-surface fixed top-0 z-30 h-full w-80 overflow-hidden"
        style={{
          left: isExpanded ? "0" : "-20rem",
          transition: "left 300ms ease-in-out",
        }}
        aria-hidden={!isExpanded}
      >
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="text-lg font-semibold">Nearby Parking</h3>
            <div className="mt-1 text-xs text-slate-500">
              Only the top 20 results are shown.
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {hasParkingSpots ? (
              <div className="space-y-3">
                {spots.map((spot) => (
                  <button
                    key={spot.id}
                    type="button"
                    onClick={() => onSelectSpot(spot)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 font-medium">
                        {spot.name ?? "Parking Spot"}
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {spot.sheltered ? (
                          <Umbrella
                            size={14}
                            className="text-sky-500"
                            aria-label="Sheltered"
                          />
                        ) : (
                          <UmbrellaOff
                            size={14}
                            className="text-slate-600"
                            aria-label="Not sheltered"
                          />
                        )}
                        {hasUserLocation && (
                          <div className="text-xs whitespace-nowrap text-slate-600">
                            {Math.round(spot.distance)} m
                          </div>
                        )}
                      </div>
                    </div>
                    {spot.parkingType && (
                      <div className="mb-2 truncate text-xs text-slate-500">
                        {spot.parkingType}
                      </div>
                    )}
                    <div className="text-xs text-slate-600">
                      Capacity: {spot.capacity}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-600">
                <MapPinOff
                  size={28}
                  className="text-slate-400"
                  aria-hidden="true"
                />
                <p className="max-w-48 text-sm font-medium">
                  No parking spots in this area...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
