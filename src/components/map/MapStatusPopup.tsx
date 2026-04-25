interface MapStatusPopupProps {
  message: string;
  variant: "loading" | "error" | "success";
}

export default function MapStatusPopup({
  message,
  variant,
}: MapStatusPopupProps) {
  return (
    <div
      className={`rounded-md px-4 py-2 text-sm font-semibold shadow-md ${
        variant === "loading"
          ? "border border-sky-300 bg-sky-50 text-sky-900"
          : variant === "success"
            ? "border border-green-300 bg-green-50 text-green-900"
            : "border border-red-300 bg-red-50 text-red-900"
      }`}
    >
      {message}
    </div>
  );
}
