"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useMyReservations, type Reservation } from "./_hooks/useMyReservations";
import { ProfileForm } from "./_components/ProfileForm";
import { CancelModal } from "./_components/CancelModal";
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

        <details className="group mt-10 rounded-2xl border border-zinc-200 bg-white open:pb-6 open:shadow-sm">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-4 text-sm font-semibold text-zinc-900">
            プロフィール設定
            <svg
              className="h-4 w-4 text-zinc-400 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="px-6">
            <ProfileForm user={user} />
          </div>
        </details>
      </div>

      {confirmTarget && (
        <CancelModal
          details={{
            dateLabel: formatDateLabel(confirmTarget.date),
            startTime: formatTime(confirmTarget.start_time),
            endTime: formatTime(confirmTarget.end_time),
            duration: getDurationHours(confirmTarget.start_time, confirmTarget.end_time),
            total: confirmTarget.price,
          }}
          onConfirm={handleConfirm}
          onClose={() => setConfirmTarget(null)}
          loading={cancelling === confirmTarget.id}
        />
      )}
    </div>
  );
}
