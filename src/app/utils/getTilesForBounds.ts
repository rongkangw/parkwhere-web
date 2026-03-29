import { TILE_SIZE } from "@/core/constants/map/MapConstants";
import type { FeatureCollection, Polygon } from "geojson";

function getTilesForBounds(
  minLng: number,
  maxLng: number,
  minLat: number,
  maxLat: number,
): string[] {
  const minX = Math.floor(minLng / TILE_SIZE);
  const maxX = Math.floor(maxLng / TILE_SIZE);
  const minY = Math.floor(minLat / TILE_SIZE);
  const maxY = Math.floor(maxLat / TILE_SIZE);

  const tiles: string[] = [];
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      tiles.push(`${x}_${y}`);
    }
  }
  return tiles;
}

/**
 * Build GeoJSON FeatureCollection for a set of tiles
 */
function buildTileGeoJSON(
  tileIds: string[],
  tilesWithData: Set<string> = new Set(),
): FeatureCollection<Polygon> {
  const features: FeatureCollection<Polygon>["features"] = new Array(
    tileIds.length,
  );

  for (let i = 0; i < tileIds.length; i++) {
    const tileId = tileIds[i];
    const [x, y] = tileId.split("_").map(Number);

    const minLng = x * TILE_SIZE;
    const minLat = y * TILE_SIZE;
    const maxLng = (x + 1) * TILE_SIZE;
    const maxLat = (y + 1) * TILE_SIZE;

    features[i] = {
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
    };
  }

  return {
    type: "FeatureCollection",
    features,
  };
}

/**
 * Self-contained function to generate city tile GeoJSON for MapView
 */
export default function generateCityTileOverlay(
  tilesWithData: Set<string> = new Set(),
): FeatureCollection<Polygon> {
  // Replace with your city bounds
  const MIN_LNG = 103.6;
  const MAX_LNG = 104.04;
  const MIN_LAT = 1.2;
  const MAX_LAT = 1.48;

  const allTiles = getTilesForBounds(MIN_LNG, MAX_LNG, MIN_LAT, MAX_LAT);

  return buildTileGeoJSON(allTiles, tilesWithData);
}
