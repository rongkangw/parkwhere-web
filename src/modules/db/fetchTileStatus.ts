import MapTileResponse from "@/core/constants/map/MapTileResponse";

/**
 * Checks if a tile has already been fetched.
 * @param {string} tileId - The tile ID to check
 * @returns {Promise<MapTileResponse>} - An object containing tile status and metadata
 */
export default async function fetchTileStatus(
  tileId: string,
): Promise<MapTileResponse> {
  const params = new URLSearchParams({ tileId });
  const res = await fetch(`/api/fetch_tile_status?${params.toString()}`);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Code: ${res.status} ${errorText}`);
  }

  const data = (await res.json()) as {
    tileId: string;
    lat: number;
    lng: number;
    fetched: boolean;
    lastFetched: string | null;
  };

  return {
    tileId: data.tileId,
    lat: Number(data.lat),
    lng: Number(data.lng),
    fetched: Boolean(data.fetched),
    lastFetched: data.lastFetched ? new Date(data.lastFetched) : null,
  };
}
