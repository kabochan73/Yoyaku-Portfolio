"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCalendar } from "@/hooks/useCalendar";
import { addDays, addMonths, getMonday, toYM, toYMD, DAY_LABELS } from "@/lib/date";
import { WeekNavigator } from "@/components/calendar/WeekNavigator";
import { CalendarGrid } from "@/components/calendar/CalendarGrid";
import { useAdminReservations, type AdminReservation } from "../../_hooks/useAdminReservations";
import { AdminReservationModal } from "./AdminReservationModal";
import { PhoneReservationModal } from "./PhoneReservationModal";

type Price = { type: "weekday" | "weekend"; amount_per_hour: number };

type NewReservationDetails = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
  dateLabel: string;
};

export function AdminCalendar() {
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

  const months = useMemo(() => [...new Set(weekDays.map(toYM))], [weekDays]);
  const { isLoading, getSlotStatus } = useCalendar(months);
  const {
    getReservation,
    cancel,
    cancelling,
    cancelError,
    clearCancelError,
    create,
    creating,
    createError,
    clearCreateError,
  } = useAdminReservations(months);

  const { data: prices } = useQuery({
    queryKey: ["prices"],
    queryFn: async () => {
      const { data } = await api.get<Price[]>("/prices");
      return data;
    },
    staleTime: Infinity,
  });

  const [modalReservation, setModalReservation] = useState<AdminReservation | null>(null);
  const [selectedStart, setSelectedStart] = useState<{ date: string; hour: number } | null>(null);
  const [newReservation, setNewReservation] = useState<NewReservationDetails | null>(null);

  const weekLabel = `${weekDays[0].getMonth() + 1}/${weekDays[0].getDate()} 〜 ${weekDays[6].getMonth() + 1}/${weekDays[6].getDate()}`;

  const minMonday = useMemo(() => getMonday(addMonths(today, -3)), [today]);
  const canGoPrev = weekStart > minMonday;

  const getPricePerHour = (date: string): number => {
    const day = weekDays.find((d) => toYMD(d) === date);
    if (!day || !prices) return 0;
    const type = day.getDay() === 0 || day.getDay() === 6 ? "weekend" : "weekday";
    return prices.find((p) => p.type === type)?.amount_per_hour ?? 0;
  };

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
    const isPast = date < toYMD(today);

    if (status === "booked") {
      const reservation = getReservation(date, hour);
      if (reservation) setModalReservation(reservation);
      return;
    }

    // 過去日は実績確認のみ許可し、新規の電話予約の開始点としては選べないようにする
    if (isPast) return;

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
      setNewReservation({
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

  const handleCancel = async () => {
    if (!modalReservation) return;
    await cancel(modalReservation);
    setModalReservation(null);
  };

  const handleCreate = async (bookerName: string) => {
    if (!newReservation) return;
    const ok = await create({ ...newReservation, bookerName });
    if (ok) setNewReservation(null);
  };

  return (
    <>
      <section className="mx-auto max-w-5xl rounded-2xl">

        <WeekNavigator
          weekLabel={weekLabel}
          canGoPrev={canGoPrev}
          canGoNext
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
          bookedClickable
          getBookedLabel={(date, hour) => getReservation(date, hour)?.booker_name}
        />
      </section>

      {modalReservation && (
        <AdminReservationModal
          reservation={modalReservation}
          onCancel={handleCancel}
          onClose={() => {
            setModalReservation(null);
            clearCancelError();
          }}
          cancelling={cancelling === modalReservation.id}
          error={cancelError}
        />
      )}

      {newReservation && (
        <PhoneReservationModal
          details={newReservation}
          submitting={creating}
          error={createError}
          onSubmit={handleCreate}
          onClose={() => {
            setNewReservation(null);
            clearCreateError();
          }}
        />
      )}
    </>
  );
}
