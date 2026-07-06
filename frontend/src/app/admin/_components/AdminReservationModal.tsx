import { DAY_LABELS } from "@/lib/date";
import type { AdminReservation } from "../_hooks/useAdminReservations";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${y}年${m}月${d}日（${DAY_LABELS[dow]}）`;
}

type Props = {
  reservation: AdminReservation;
  onCancel: () => void;
  onClose: () => void;
  cancelling: boolean;
  error: string | null;
};

export function AdminReservationModal({ reservation, onCancel, onClose, cancelling, error }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">予約詳細</h2>
        <div className="mb-6 space-y-2 rounded-xl bg-zinc-50 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">予約者</span>
            <span className="font-medium text-zinc-900">{reservation.booker_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">日付</span>
            <span className="font-medium">{formatDate(reservation.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">時間</span>
            <span className="font-medium">
              {reservation.start_time} 〜 {reservation.end_time}
            </span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2">
            <span className="font-semibold text-zinc-700">料金</span>
            <span className="font-bold text-zinc-900">¥{reservation.price.toLocaleString()}</span>
          </div>
        </div>
        {error && <p className="mb-3 text-center text-xs text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            閉じる
          </button>
          <button
            onClick={onCancel}
            disabled={cancelling}
            className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {cancelling ? "キャンセル中..." : "キャンセルする"}
          </button>
        </div>
      </div>
    </div>
  );
}
