"use client";

import { useMemo, useState } from "react";
import { useCalendar } from "../../_hooks/useCalendar";
import { addDays, getMonday, toYM } from "../../_utils/date";
import { WeekNavigator } from "./WeekNavigator";
import { CalendarGrid } from "./CalendarGrid";

export function WeeklyCalendar() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const [selectedStart, setSelectedStart] = useState<{ date: string; hour: number } | null>(null);

  const months = useMemo(() => [...new Set(weekDays.map(toYM))], [weekDays]);
  const { isLoading, getSlotStatus } = useCalendar(months);

  // 「このマスを終了時間として選べるか」を判定する
  // 条件: ①開始時間と同じ日付 ②1〜3時間の範囲内（=合計2〜4コマ） ③開始〜終了の間が全部空いている
  const isValidEnd = (date: string, hour: number): boolean => {
    if (!selectedStart || selectedStart.date !== date) return false;
    const diff = hour - selectedStart.hour;
    if (diff < 1 || diff > 3) return false;
    for (let h = selectedStart.hour; h <= hour; h++) {
      if (getSlotStatus(date, h) !== "available") return false;
    }
    return true;
  };

  const handleSlotClick = (date: string, hour: number) => {
    const status = getSlotStatus(date, hour);

    if (!selectedStart) {
      if (status !== "available") return;
      setSelectedStart({ date, hour });
      return;
    }

    if (isValidEnd(date, hour)) {
      // TODO: ReservationModalを開いて予約内容を確認・送信する(次のステップで実装)
      setSelectedStart(null);
      return;
    }

    if (status !== "available") {
      setSelectedStart(null);
      return;
    }
    setSelectedStart({ date, hour });
  };

  const todayMonday = useMemo(() => getMonday(today), [today]);
  const canGoPrev = weekStart > todayMonday;
  const canGoNext = addDays(weekStart, 7) <= addDays(today, 31);
  const weekLabel = `${weekDays[0].getMonth() + 1}/${weekDays[0].getDate()} 〜 ${weekDays[6].getMonth() + 1}/${weekDays[6].getDate()}`;

  return (
    <section className="bg-zinc-50 py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-1 flex items-center gap-2 text-xl font-bold text-zinc-900">
          <span>📅</span> 空き状況・予約
        </h2>

        <WeekNavigator
          weekLabel={weekLabel}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={() => setWeekStart((d) => addDays(d, -7))}
          onNext={() => setWeekStart((d) => addDays(d, 7))}
          hasSelection={selectedStart !== null}
          onResetSelection={() => setSelectedStart(null)}
        />

        <CalendarGrid
          weekDays={weekDays}
          today={today}
          isLoading={isLoading}
          getSlotStatus={getSlotStatus}
          selectedStart={selectedStart}
          isValidEnd={isValidEnd}
          onSlotClick={handleSlotClick}
        />
      </div>
    </section>
  );
}
