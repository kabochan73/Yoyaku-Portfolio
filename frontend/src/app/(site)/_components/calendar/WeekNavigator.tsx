type Props = {
  weekLabel: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  hasSelection: boolean;
  onResetSelection: () => void;
};

export function WeekNavigator({
  weekLabel,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  hasSelection,
  onResetSelection,
}: Props) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {hasSelection
            ? "終了時間をクリックしてください（2〜4時間）"
            : "ご希望の開始時間をクリックしてください"}
        </p>
        {hasSelection && (
          <button
            onClick={onResetSelection}
            className="text-xs text-zinc-400 underline hover:text-zinc-600"
          >
            選択をリセット
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← 前の週
        </button>
        <span className="text-sm font-medium text-zinc-700">{weekLabel}</span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          次の週 →
        </button>
      </div>
    </>
  );
}
