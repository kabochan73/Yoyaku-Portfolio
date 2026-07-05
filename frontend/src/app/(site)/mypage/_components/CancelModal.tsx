type CancelDetails = {
  dateLabel: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
};

type Props = {
  details: CancelDetails;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
};

export function CancelModal({ details, onConfirm, onClose, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">予約をキャンセルしますか？</h2>
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
            <span className="font-semibold">合計料金</span>
            <span className="font-bold text-green-600">¥{details.total.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            戻る
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "キャンセル中..." : "キャンセルする"}
          </button>
        </div>
      </div>
    </div>
  );
}
