import ParkingSpot from "@/core/constants/ParkingSpot";
import ParkingSpotDbResponse from "@/core/constants/ParkingSpotDbResponse";

export default async function fetchDbSpots(
  lat: number,
  lng: number,
  dist: number = 500,
): Promise<ParkingSpot[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    dist: String(dist),
  });

  console.log("(DB) Fetching with params: " + params.toString());

  const res = await fetch(`/api/fetch_db_spots?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawSpots = Array.isArray(data) ? data : [];

  console.debug("(DB) Fetched " + rawSpots.length + " parking spots");

  return rawSpots.map(
    (spot: Partial<ParkingSpotDbResponse>): ParkingSpot => ({
      id: String(spot.uniqueid ?? ""),
      name: String(spot.name ?? ""),
      lat: Number(spot.lat ?? 0),
      lng: Number(spot.lng ?? 0),
      capacity: Number(spot.capacity ?? 0),
      occupancy: Number(spot.occupancy ?? 0),
      parkingType: String(spot.parkingtype ?? ""),
      sheltered: Boolean(spot.sheltered ?? false),
      sourceType: spot.sourcetype === "community" ? "community" : "official",
    }),
  );
}
