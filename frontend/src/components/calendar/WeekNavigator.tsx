type Props = {
  weekLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
};

export function WeekNavigator({
  weekLabel,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <button
        onClick={() => canGoPrev && onPrev()}
        aria-disabled={!canGoPrev}
        className={`cursor-pointer rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium bg-white text-zinc-800 transition hover:bg-zinc-200 ${
          canGoPrev ? "" : "opacity-30"
        }`}
      >
        ← 前の週
      </button>
      <span className="text-xl font-medium text-zinc-800">{weekLabel}</span>
      <button
        onClick={() => canGoNext && onNext()}
        aria-disabled={!canGoNext}
        className={`cursor-pointer rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium bg-white text-zinc-800 transition hover:bg-zinc-200 ${
          canGoNext ? "" : "opacity-30"
        }`}
      >
        次の週 →
      </button>
    </div>
  );
}
