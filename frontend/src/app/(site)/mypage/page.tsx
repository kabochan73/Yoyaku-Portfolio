"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useMyReservations, type Reservation } from "./_hooks/useMyReservations";
import { DAY_LABELS } from "../_utils/date";

function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${y}年${m}月${d}日（${DAY_LABELS[dow]}）`;
}

function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

function getDurationHours(startTime: string, endTime: string): number {
  return Number(endTime.slice(0, 2)) - Number(startTime.slice(0, 2));
}

function CancelModal({
  reservation,
  onConfirm,
  onClose,
  loading,
}: {
  reservation: Reservation;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-zinc-900">予約をキャンセルしますか？</h2>
        <div className="mb-6 space-y-2 rounded-xl text-black p-4 text-xl font-bold">
          <div className="flex justify-between">
            <span>日付</span>
            <span className="font-medium">{formatDateLabel(reservation.date)}</span>
          </div>
          <div className="flex justify-between">
            <span>時間</span>
            <span className="font-medium">
              {formatTime(reservation.start_time)} 〜 {formatTime(reservation.end_time)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>利用時間</span>
            <span className="font-medium">
              {getDurationHours(reservation.start_time, reservation.end_time)}時間
            </span>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2">
            <span className="font-semibold">合計料金</span>
            <span className="font-bold text-green-600">¥{reservation.price.toLocaleString()}</span>
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

export default function MyPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const { reservations, isLoading, cancel, cancelling, cancelError, clearCancelError } =
    useMyReservations();
  const [confirmTarget, setConfirmTarget] = useState<Reservation | null>(null);

  useEffect(() => {
    if (!userLoading && !user) router.replace("/login");
  }, [userLoading, user, router]);

  if (userLoading || !user) return null;

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    await cancel(confirmTarget);
    setConfirmTarget(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto max-w-2xl px-4 py-10">

        {cancelError && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{cancelError}</span>
            <button onClick={clearCancelError} className="ml-4 text-red-500 hover:text-red-700">
              ✕
            </button>
          </div>
        )}

        <section>

          {isLoading && (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-green-600" />
            </div>
          )}

          {!isLoading && reservations.length === 0 && (
            <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center text-sm text-zinc-500">
              現在、予約はありません。
            </div>
          )}

          {!isLoading && reservations.length > 0 && (
            <ul className="space-y-4">
              {reservations.map((r) => (
                <li
                  key={r.id}
                  className="rounded-2xl border border-zinc-200 bg-white px-6 py-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-900">{formatDateLabel(r.date)}</p>
                      <p className="text-sm text-zinc-600">
                        {formatTime(r.start_time)} 〜 {formatTime(r.end_time)}
                      </p>
                      <p className="text-sm font-medium text-zinc-800">
                        ¥{r.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setConfirmTarget(r)}
                      disabled={cancelling === r.id}
                      className="shrink-0 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {confirmTarget && (
        <CancelModal
          reservation={confirmTarget}
          onConfirm={handleConfirm}
          onClose={() => setConfirmTarget(null)}
          loading={cancelling === confirmTarget.id}
        />
      )}
    </div>
  );
}
