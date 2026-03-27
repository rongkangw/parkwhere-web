export default function roundCoordinate(
  value: number,
  precision: number,
): number {
  return Number(value.toFixed(precision));
}
