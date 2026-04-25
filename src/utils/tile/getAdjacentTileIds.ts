import parseTileId from "@/utils/tile/parseTileId";

export default function getAdjacentTileIds(tileId: string): string[] {
  const { x, y } = parseTileId(tileId);
  const tileIds: string[] = [];

  for (let deltaX = -1; deltaX <= 1; deltaX++) {
    for (let deltaY = -1; deltaY <= 1; deltaY++) {
      tileIds.push(`${x + deltaX}_${y + deltaY}`);
    }
  }

  return tileIds;
}