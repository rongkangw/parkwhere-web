interface MapErrorPopupProps {
  message:
    | string
    | "An unexpected error occurred while loading bike parking data.";
  variant: "loading" | "error";
}

export default function MapErrorPopup({
  message,
  variant = "error",
}: MapErrorPopupProps) {
  const isLoading = variant === "loading";

  return (
    <div className="pointer-events-none fixed left-1/2 top-6 z-20 -translate-x-1/2">
      <div
        className={`rounded-md px-4 py-2 text-sm font-semibold shadow-md ${
          isLoading
            ? "border border-sky-300 bg-sky-50 text-sky-900"
            : "border border-red-300 bg-red-50 text-red-900"
        }`}
      >
        {message}
      </div>
    </div>
  );
}
