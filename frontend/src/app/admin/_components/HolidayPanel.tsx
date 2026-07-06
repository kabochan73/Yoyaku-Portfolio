"use client";

import { useState } from "react";
import { useAdminHolidays } from "../_hooks/useAdminHolidays";

export function HolidayPanel() {
  const {
    holidays,
    isLoading,
    add,
    adding,
    addError,
    warning,
    confirmWithForce,
    dismissWarning,
    remove,
    removing,
  } = useAdminHolidays();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    const ok = await add({ date, reason });
    if (ok) {
      setDate("");
      setReason("");
    }
  };

  if (isLoading) {
    return <p className="text-sm text-zinc-400">読み込み中...</p>;
  }

  return (
    <>
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">日付</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-zinc-700">
                理由（任意）
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="例：設備メンテナンス"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>
          {addError && <p className="text-xs text-red-500">{addError}</p>}
          <button
            type="submit"
            disabled={adding}
            className="rounded-lg w-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {adding ? "登録中..." : "休業日を追加"}
          </button>
        </form>

        {holidays && holidays.length > 0 && (
          <ul className="space-y-2">
            {holidays.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-zinc-900">{h.date}</span>
                  {h.reason && <span className="ml-2 text-zinc-500">— {h.reason}</span>}
                </div>
                <button
                  onClick={() => remove(h.id)}
                  disabled={removing === h.id}
                  className="text-xs text-red-500 transition hover:text-red-700 disabled:opacity-50"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        )}
        {holidays?.length === 0 && (
          <p className="text-sm text-zinc-400">登録された休業日はありません</p>
        )}
      </div>

      {warning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-lg font-bold text-zinc-900">確認</h2>
            <p className="mb-6 text-sm text-zinc-700">{warning.message}</p>
            <div className="flex gap-3">
              <button
                onClick={dismissWarning}
                className="flex-1 rounded-lg border border-zinc-300 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                キャンセル
              </button>
              <button
                onClick={confirmWithForce}
                disabled={adding}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {adding ? "処理中..." : "強制設定する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
