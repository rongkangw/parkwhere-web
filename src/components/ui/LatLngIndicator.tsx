type LatLngDebugProps = {
  latitude: number;
  longitude: number;
};

export default function LatLngIndicator({
  latitude,
  longitude,
}: LatLngDebugProps) {
  return (
    <div className="ui-floating-surface px-3 py-2 font-mono text-xs whitespace-nowrap">
      lat: {latitude.toFixed(6)}, lng: {longitude.toFixed(6)}
    </div>
  );
}
