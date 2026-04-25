import ParkingSpot from "@/core/constants/parkingspot/ParkingSpot";

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
    const data = await res.json();
    throw new Error(
      `(DB) Update spots failed for tile ${tileId}: ${data.error}`,
    );
  }
}
