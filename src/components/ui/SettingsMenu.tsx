import { useState } from "react";
import { Settings } from "lucide-react";
import { SettingsMenuRow } from "@/components/ui/SettingsMenuRow";

type SettingsMenuProps = {
  tileOverlayEnabled: boolean;
  onTileOverlayToggle: (enabled: boolean) => void;
};

export default function SettingsMenu({
  tileOverlayEnabled,
  onTileOverlayToggle,
}: SettingsMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative flex items-end">
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className="z-10 rounded-full bg-white/95 p-2 transition-colors hover:bg-slate-200"
      >
        <Settings size={20} className="text-slate-700" />
      </button>
      {isExpanded && (
        <div className="absolute right-0 bottom-full z-10 mb-2 w-56 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur-sm">
          <SettingsMenuRow
            settingName="Show Tile Overlay"
            toggleValue={tileOverlayEnabled}
            onToggle={onTileOverlayToggle}
          />
        </div>
      )}
    </div>
  );
}
