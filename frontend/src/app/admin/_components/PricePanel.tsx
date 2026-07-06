"use client";

import { useAdminPrices } from "../_hooks/useAdminPrices";

export function PricePanel() {
  const { prices, isLoading, update, saving, saveError, saveSuccess } = useAdminPrices();

  const weekday = prices?.find((p) => p.type === "weekday");
  const weekend = prices?.find((p) => p.type === "weekend");

  if (isLoading) {
    return <p className="text-sm text-zinc-400">読み込み中...</p>;
  }

  return (
    <form
      key={`${weekday?.amount_per_hour}-${weekend?.amount_per_hour}`}
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        update(Number(data.get("weekday")), Number(data.get("weekend")));
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            平日（円/時間）
          </label>
          <input
            type="number"
            name="weekday"
            defaultValue={weekday?.amount_per_hour}
            min={0}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-zinc-700">
            土日（円/時間）
          </label>
          <input
            type="number"
            name="weekend"
            defaultValue={weekend?.amount_per_hour}
            min={0}
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>
      {saveError && <p className="text-xs text-red-500">{saveError}</p>}
      {saveSuccess && <p className="text-xs text-green-600">保存しました</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg w-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "保存中..." : "保存する"}
      </button>
    </form>
  );
}
