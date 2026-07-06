"use client";

import { useState } from "react";
import { DAY_LABELS } from "@/lib/date";
import { useAdminRegularHolidays } from "../_hooks/useAdminRegularHolidays";

type FormProps = {
  initialDays: number[];
  onSave: (days: number[]) => void;
  saving: boolean;
  saveError: string | null;
  saveSuccess: boolean;
};

function RegularHolidayForm({ initialDays, onSave, saving, saveError, saveSuccess }: FormProps) {
  const [selectedDays, setSelectedDays] = useState<number[]>(initialDays);

  const toggle = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(selectedDays);
      }}
      className="space-y-4"
    >
      <div className="flex gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <button
            key={day}
            type="button"
            onClick={() => toggle(day)}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
              selectedDays.includes(day)
                ? "bg-red-500 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {DAY_LABELS[day]}
          </button>
        ))}
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

export function RegularHolidayPanel() {
  const { regularHolidays, isLoading, update, saving, saveError, saveSuccess } =
    useAdminRegularHolidays();

  if (isLoading) {
    return <p className="text-sm text-zinc-400">読み込み中...</p>;
  }

  const initialDays = (regularHolidays ?? []).map((h) => h.day_of_week);

  return (
    <RegularHolidayForm
      key={initialDays.join(",")}
      initialDays={initialDays}
      onSave={update}
      saving={saving}
      saveError={saveError}
      saveSuccess={saveSuccess}
    />
  );
}
