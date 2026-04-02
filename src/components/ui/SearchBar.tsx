type SearchBarProps = {
  value: string;
  onChangeValue: (value: string) => void;
  placeholder?: string;
  onEnter?: () => void;
  className?: string;
};

export default function SearchBar({
  value,
  onChangeValue,
  placeholder = "Search",
  onEnter,
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`flex h-12 w-full rounded-lg border border-slate-300 bg-white text-slate-900 shadow-sm ${className}`}
    >
      <div className="w-full px-4 py-2">
        <label htmlFor="parking-search" className="sr-only">
          Search input
        </label>
        <input
          id="parking-search"
          type="text"
          value={value}
          onChange={(event) => onChangeValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onEnter?.();
            }
          }}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
