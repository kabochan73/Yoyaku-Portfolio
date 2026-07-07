"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCalendar } from "@/hooks/useCalendar";
import { useReservation } from "../../_hooks/useReservation";
import { addDays, getMonday, toYM, toYMD, DAY_LABELS } from "@/lib/date";
import { WeekNavigator } from "@/components/calendar/WeekNavigator";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { ReservationModal } from "./ReservationModal";

type Price = { type: "weekday" | "weekend"; amount_per_hour: number };

type ReservationDetails = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
  dateLabel: string;
};

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
  const [details, setDetails] = useState<ReservationDetails | null>(null);

  const months = useMemo(() => [...new Set(weekDays.map(toYM))], [weekDays]);
  const { isLoading, getSlotStatus } = useCalendar(months);
  const { submit, submitting, submitError, clearError, isLoggedIn } = useReservation();

  const { data: prices } = useQuery({
    queryKey: ["prices"],
    queryFn: async () => {
      const { data } = await api.get<Price[]>("/prices");
      return data;
    },
    staleTime: Infinity,
  });

  const getPricePerHour = (date: string): number => {
    const day = weekDays.find((d) => toYMD(d) === date);
    if (!day || !prices) return 0;
    const type = day.getDay() === 0 || day.getDay() === 6 ? "weekend" : "weekday";
    return prices.find((p) => p.type === type)?.amount_per_hour ?? 0;
  };

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
      const startHour = selectedStart.hour;
      const duration = hour - startHour + 1;
      const startTime = `${String(startHour).padStart(2, "0")}:00`;
      const endTime = `${String(hour + 1).padStart(2, "0")}:00`;
      const day = weekDays.find((d) => toYMD(d) === date)!;
      const dateLabel = `${day.getFullYear()}年${day.getMonth() + 1}月${day.getDate()}日（${DAY_LABELS[day.getDay()]}）`;
      setDetails({
        date,
        startTime,
        endTime,
        duration,
        total: getPricePerHour(date) * duration,
        dateLabel,
      });
      setSelectedStart(null);
      return;
    }

    if (status !== "available") {
      setSelectedStart(null);
      return;
    }
    setSelectedStart({ date, hour });
  };

  const handleSubmit = async () => {
    if (!details) return;
    const ok = await submit(details);
    if (ok) setDetails(null);
  };

  const handleClose = () => {
    setDetails(null);
    clearError();
  };

  const todayMonday = useMemo(() => getMonday(today), [today]);
  const canGoPrev = weekStart > todayMonday;
  const canGoNext = addDays(weekStart, 7) <= addDays(today, 31);
  const weekLabel = `${weekDays[0].getMonth() + 1}/${weekDays[0].getDate()} 〜 ${weekDays[6].getMonth() + 1}/${weekDays[6].getDate()}`;

  return (
    <>
      <section className="bg-zinc-50 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-1 flex items-center pb-2 gap-2 text-xl font-bold text-zinc-900">
            🗓️ 空き状況・クリックで予約！
          </h2>

          <WeekNavigator
            weekLabel={weekLabel}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={() => setWeekStart((d) => addDays(d, -7))}
            onNext={() => setWeekStart((d) => addDays(d, 7))}
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

      {details && (
        <ReservationModal
          details={details}
          isLoggedIn={isLoggedIn}
          submitting={submitting}
          error={submitError}
          onSubmit={handleSubmit}
          onClose={handleClose}
        />
      )}
    </>
  );
}
