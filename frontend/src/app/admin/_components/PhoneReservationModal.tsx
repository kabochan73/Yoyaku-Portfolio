import { useState } from "react";

type ReservationDetails = {
  dateLabel: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
};

type Props = {
  details: ReservationDetails;
  submitting: boolean;
  error: string | null;
  onSubmit: (bookerName: string) => void;
  onClose: () => void;
};

export function PhoneReservationModal({ details, submitting, error, onSubmit, onClose }: Props) {
  const [bookerName, setBookerName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-bold text-zinc-900">電話予約の登録</h3>
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

        <label className="mb-1.5 block text-sm font-medium text-zinc-700">予約者名</label>
        <input
          type="text"
          value={bookerName}
          onChange={(e) => setBookerName(e.target.value)}
          placeholder="山田 太郎"
          className="mb-4 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
        />

        {error && <p className="mb-3 text-center text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={() => onSubmit(bookerName)}
            disabled={submitting || bookerName.trim().length === 0}
            className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "登録中..." : "登録する"}
          </button>
        </div>
      </div>
    </div>
  );
}
