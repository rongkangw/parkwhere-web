import parseTileId from "@/utils/tile/parseTileId";
import { TILE_SIZE } from "@/core/constants/MapConstants";

export function getTileCenter(tileId: string): { lat: number; lng: number } {
  const { x, y } = parseTileId(tileId);

  return {
    lng: (x + 0.5) * TILE_SIZE,
    lat: (y + 0.5) * TILE_SIZE,
  };
}