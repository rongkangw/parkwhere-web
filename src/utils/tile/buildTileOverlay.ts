import {
  MAX_LAT,
  MAX_LNG,
  MIN_LAT,
  MIN_LNG,
  TILE_SIZE,
} from "@/core/constants/ui/MapConstants";
import type { FeatureCollection, Polygon } from "geojson";

export default function buildTileOverlay(
  tilesWithData: Set<string> = new Set(),
): FeatureCollection<Polygon> {
  const minX = Math.floor(MIN_LNG / TILE_SIZE);
  const maxX = Math.floor(MAX_LNG / TILE_SIZE);
  const minY = Math.floor(MIN_LAT / TILE_SIZE);
  const maxY = Math.floor(MAX_LAT / TILE_SIZE);

  const features: FeatureCollection<Polygon>["features"] = [];

  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      const tileId = `${x}_${y}`;

      const minLng = x * TILE_SIZE;
      const minLat = y * TILE_SIZE;
      const maxLng = (x + 1) * TILE_SIZE;
      const maxLat = (y + 1) * TILE_SIZE;

      features.push({
        type: "Feature",
        properties: {
          hasData: tilesWithData.has(tileId),
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [minLng, minLat],
              [minLng, maxLat],
              [maxLng, maxLat],
              [maxLng, minLat],
              [minLng, minLat],
            ],
          ],
        },
      });
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
}
