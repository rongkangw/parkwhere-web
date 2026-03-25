import { ParkingSpotResponse } from "@/constants/ParkingSpotResponse";

export async function fetchBikeParking(
  lat: number,
  lng: number,
  dist: number = 0.75,
): Promise<ParkingSpotResponse[]> {
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

  // Datamall fields can be strings; normalize before map rendering.
  return rawSpots.map((spot: Partial<ParkingSpotResponse>) => ({
    Description: String(spot.Description ?? ""),
    Latitude: Number(spot.Latitude),
    Longitude: Number(spot.Longitude),
    RackType: String(spot.RackType ?? ""),
    RackCount: Number(spot.RackCount ?? 0),
    ShelterIndicator: spot.ShelterIndicator === "Y" ? "Y" : "N",
  }));
}
