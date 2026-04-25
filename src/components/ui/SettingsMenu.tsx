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
        className="ui-floating-btn z-10 p-2"
      >
        <Settings size={20} className="text-slate-700" />
      </button>
      {isExpanded && (
        <div className="ui-floating-surface absolute right-0 bottom-full z-10 mb-2 w-56 p-2">
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
