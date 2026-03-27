import ParkingSpot from "@/core/constants/ParkingSpot";

type UpdateDbSpotsPayload = {
  tileId: string;
  centerLat: number;
  centerLng: number;
  spots: ParkingSpot[];
};

export default async function updateDbSpots(
  tileId: string,
  centerLat: number,
  centerLng: number,
  spots: ParkingSpot[],
): Promise<void> {
  const payload: UpdateDbSpotsPayload = {
    tileId,
    centerLat,
    centerLng,
    spots,
  };

  const res = await fetch("/api/update_db_spots", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code: ${res.status} ${errorText}`);
  }
}
