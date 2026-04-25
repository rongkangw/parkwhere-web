export default function parseTileId(tileId: string): { x: number; y: number } {
  const [x, y] = tileId.split("_").map(Number);

  return { x, y };
}