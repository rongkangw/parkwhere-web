export default function DeveloperNote() {
  return (
    <div className="fixed bottom-2 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded bg-white/60 px-3 py-1 text-xs text-slate-600 backdrop-blur">
      <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
        Beta
      </span>
      <span className="text-xs text-slate-700">
        Report bugs & improvements on
      </span>
      <a
        href="https://github.com/rongkangw/parkwhere-web/issues"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-slate-700 underline"
      >
        GitHub
      </a>
    </div>
  );
}
