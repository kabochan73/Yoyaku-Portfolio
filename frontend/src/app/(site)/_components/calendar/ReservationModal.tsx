type ReservationDetails = {
  dateLabel: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
};

type Props = {
  details: ReservationDetails;
  isLoggedIn: boolean;
  submitting: boolean;
  error: string | null;
  onSubmit: () => void;
  onClose: () => void;
};

export function ReservationModal({
  details,
  isLoggedIn,
  submitting,
  error,
  onSubmit,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-zinc-900">予約内容の確認</h3>
        <div className="mb-6 space-y-2 rounded-xl text-black p-4 text-xl font-bold">
          <div className="flex justify-between">
            <span>日付</span>
            <span className="font-medium">{details.dateLabel}</span>
          </div>
          <div className="flex justify-between">
            <span>時間</span>
            <span className="font-medium">
              {details.startTime} 〜 {details.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span>利用時間</span>
            <span className="font-medium">{details.duration}時間</span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2">
            <span className="font-semibold text-zinc-700">合計料金</span>
            <span className="font-bold text-green-600">¥{details.total.toLocaleString()}</span>
          </div>
        </div>
        {error && <p className="mb-3 text-center text-xs text-red-500">{error}</p>}
        {!isLoggedIn && (
          <p className="mb-3 text-center text-xs text-zinc-500">予約にはログインが必要です</p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            キャンセル
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "処理中..." : isLoggedIn ? "予約する" : "ログインして予約"}
          </button>
        </div>
      </div>
    </div>
  );
}
