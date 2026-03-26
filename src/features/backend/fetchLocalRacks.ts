export default async function fetchLocalRacks(
  lat: number,
  lng: number,
  dist: number,
) {
  const res = await fetch(
    `http://localhost:4000/api/parking/nearby?lat=${lat}&lng=${lng}&radius=${dist}`,
  );

  if (!res.ok) throw new Error("Failed to fetch parking spots");
  return res.json();
}
