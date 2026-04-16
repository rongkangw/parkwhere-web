type LatLngDebugProps = {
  latitude: number;
  longitude: number;
};

export default function LatLngIndicator({
  latitude,
  longitude,
}: LatLngDebugProps) {
  return (
    <div className="rounded-lg bg-white/95 px-3 py-2 font-mono text-xs whitespace-nowrap text-slate-700 shadow-sm">
      lat: {latitude.toFixed(6)}, lng: {longitude.toFixed(6)}
    </div>
  );
}
