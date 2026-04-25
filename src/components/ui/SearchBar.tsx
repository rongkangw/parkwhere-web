import { useState } from "react";

type SearchBarProps = {
  placeholder?: string;
  searchValue?: string;
  onChangeValue?: (value: string) => void;
  onEnter: (searchValue: string) => void;
};

export default function SearchBar({
  placeholder,
  searchValue,
  onChangeValue = () => {},
  onEnter,
}: SearchBarProps) {
  const [internalSearchInput, setInternalSearchInput] = useState(
    searchValue ?? "",
  );
  const isControlled = typeof searchValue === "string";
  const renderedSearchInput = isControlled ? searchValue : internalSearchInput;

  return (
    <div className="ui-floating-surface flex h-12 w-full">
      <div className="w-full px-4 py-2">
        <label htmlFor="parking-search" className="sr-only">
          Search input
        </label>
        <input
          id="parking-search"
          type="text"
          value={renderedSearchInput}
          onChange={(event) => {
            if (!isControlled) {
              setInternalSearchInput(event.target.value);
            }
            onChangeValue(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onEnter(renderedSearchInput);
            }
          }}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
