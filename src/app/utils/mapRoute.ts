type Coordinates = {
  latitude: number;
  longitude: number;
};

export function buildMapRoute(coordinates?: Coordinates): string {
  if (!coordinates) return "/map";

  const params = new URLSearchParams({
    lat: String(coordinates.latitude),
    lng: String(coordinates.longitude),
  });

  return `/map?${params.toString()}`;
}

export function buildHomeRoute(): string {
  return "/";
}
