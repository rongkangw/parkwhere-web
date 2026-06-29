import { TILE_SIZE } from "@/core/constants/UiConstants";

export default function getTileId(lat: number, lng: number): string {
  const x = Math.floor(lng / TILE_SIZE);
  const y = Math.floor(lat / TILE_SIZE);
  return `${x}_${y}`;
}
