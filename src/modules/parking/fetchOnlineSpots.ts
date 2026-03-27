import createParkingSpotKey from "@/app/utils/createParkingSpotId";
import ParkingSpot from "@/core/constants/ParkingSpot";
import ParkingSpotApiResponse from "@/core/constants/ParkingSpotApiResponse";

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

  console.log(
    "Fetching online parking spots with params: " + params.toString(),
  );

  const res = await fetch(`/api/fetch_online_spots?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code: ${res.status} ${errorText}`);
  }

  const data = await res.json();
  const rawSpots = Array.isArray(data?.value) ? data.value : [];

  console.debug("Fetched " + rawSpots.length + " bike parking spots from API");

  return rawSpots.map((spot: Partial<ParkingSpotApiResponse>) => ({
    id: createParkingSpotKey(spot.Latitude as number, spot.Longitude as number),
    name: String(spot.Description ?? ""),
    lat: Number(spot.Latitude),
    lng: Number(spot.Longitude),
    capacity: Number(spot.RackCount ?? 0),
    occupancy: 0, // Datamall doesn't provide real-time occupancy; set to 0
    parkingType: String(spot.RackType ?? ""),
    sheltered: spot.ShelterIndicator === "Y",
    sourceType: "official",
  }));
}
