import { ParkingSpot } from "@/constants/ParkingSpot";
import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";

export default async function fetchOnlineRacks(
  lat: number,
  lng: number,
  dist: number = 0.75,
): Promise<ParkingSpot[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    dist: String(dist),
  });
  const res = await fetch(`/api/bike-parking?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawSpots = Array.isArray(data?.value) ? data.value : [];

  console.debug("Fetched " + rawSpots.length + " bike parking spots from API");

  return rawSpots.map((spot: Partial<ParkingSpotResponse>, index: number) => ({
    id: index,
    name: String(spot.Description ?? ""),
    lat: Number(spot.Latitude),
    lng: Number(spot.Longitude),
    capacity: Number(spot.RackCount ?? 0),
    occupancy: 0, // Datamall doesn't provide real-time occupancy; set to 0
    rackType: String(spot.RackType ?? ""),
    sheltered: spot.ShelterIndicator === "Y",
    sourceType: "official",
  }));
}
