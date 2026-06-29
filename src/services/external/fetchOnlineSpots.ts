import createParkingSpotId from "@/utils/parking/createParkingSpotId";
import ParkingSpot from "@/core/types/parking/ParkingSpot";
import ParkingSpotApiResponse from "@/core/types/parking/ParkingSpotApiResponse";

export default async function fetchOnlineSpots(
  lat: number,
  lng: number,
  dist: number = 0.75,
): Promise<ParkingSpot[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    dist: String(dist),
  });

  console.log("(ONLINE) Fetching with params: " + params.toString());

  const res = await fetch(`/api/fetch_online_spots?${params.toString()}`);

  if (!res.ok) {
    const data = await res.json();
    throw new Error(
      `(ONLINE) Spots fetch failed for params ${params.toString()}: ${data.error}`,
    );
  }

  const data = await res.json();
  const rawSpots = Array.isArray(data?.value) ? data.value : [];

  console.debug("(ONLINE) Fetched " + rawSpots.length + " parking spots");

  return rawSpots.map((spot: Partial<ParkingSpotApiResponse>) => ({
    id: createParkingSpotId(spot.Latitude as number, spot.Longitude as number),
    name: String(spot.Description ?? ""),
    lat: Number(spot.Latitude),
    lng: Number(spot.Longitude),
    capacity: Number(spot.RackCount ?? 0),
    parkingType: String(spot.RackType ?? ""),
    sheltered: spot.ShelterIndicator === "Y",
    sourceType: "official",
    upvotes: 0,
    downvotes: 0,
    status: "none",
  }));
}
