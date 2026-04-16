type SettingsMenuRowProps = {
  settingName: string;
  toggleValue: boolean;
  onToggle: (value: boolean) => void;
};

export function SettingsMenuRow({
  settingName,
  toggleValue,
  onToggle,
}: SettingsMenuRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2">
      <span className="text-sm text-slate-700">{settingName}</span>
      <button
        onClick={() => {
          onToggle(!toggleValue);
        }}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
        style={{
          backgroundColor: toggleValue ? "#3b82f6" : "#cbd5e1",
        }}
      >
        <span
          className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
          style={{
            transform: toggleValue ? "translateX(23px)" : "translateX(4px)",
          }}
        />
      </button>
    </div>
  );
}
