"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useCalendar } from "@/hooks/useCalendar";
import { addDays, getMonday, toYM, toYMD, DAY_LABELS, HOURS } from "@/lib/date";
import { useAdminReservations, type AdminReservation } from "../_hooks/useAdminReservations";
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

    if (status === "booked") {
      const reservation = getReservation(date, hour);
      if (reservation) setModalReservation(reservation);
      return;
    }

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
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900">予約カレンダー</h2>
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            ← 前の週
          </button>
          <span className="text-sm font-medium text-zinc-700">{weekLabel}</span>
          <button
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="rounded-lg border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          >
            次の週 →
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
              読み込み中...
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="w-24 py-3 text-center text-xs font-medium text-zinc-500">時間</th>
                  {weekDays.map((d) => {
                    const dow = d.getDay();
                    const isToday = toYMD(d) === toYMD(today);
                    const color =
                      dow === 6 ? "text-blue-600" : dow === 0 ? "text-red-500" : "text-zinc-700";
                    return (
                      <th key={toYMD(d)} className="border-l border-zinc-200 py-3 text-center">
                        <div className={`text-xs font-semibold ${color}`}>{DAY_LABELS[dow]}</div>
                        <div
                          className={`mx-auto mt-0.5 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                            isToday ? "bg-green-600 font-bold text-white" : color
                          }`}
                        >
                          {d.getDate()}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-b border-zinc-100 last:border-0">
                    <td className="py-2 text-center text-xs text-zinc-500">
                      {String(hour).padStart(2, "0")}:00〜{String(hour + 1).padStart(2, "0")}:00
                    </td>
                    {weekDays.map((d) => {
                      const date = toYMD(d);
                      const status = getSlotStatus(date, hour);
                      const reservation = status === "booked" ? getReservation(date, hour) : null;
                      const isStart =
                        selectedStart?.date === date && selectedStart.hour === hour;
                      const canBeEnd = isValidEnd(date, hour);

                      let cellCls = "";
                      let label = "";

                      if (status === "closed") {
                        cellCls = "bg-zinc-100 text-zinc-400 cursor-default";
                        label = "－";
                      } else if (status === "booked") {
                        cellCls =
                          "bg-orange-50 text-orange-700 ring-1 ring-orange-200 cursor-pointer hover:bg-orange-100";
                        label = reservation ? reservation.booker_name.slice(0, 5) : "予約済み";
                      } else if (isStart) {
                        cellCls = "bg-green-600 text-white cursor-pointer";
                        label = "開始";
                      } else if (canBeEnd) {
                        cellCls =
                          "bg-green-100 text-green-700 ring-1 ring-green-400 cursor-pointer";
                        label = "空き";
                      } else {
                        cellCls = "bg-white text-green-700 hover:bg-green-50 cursor-pointer";
                        label = "空き";
                      }

                      return (
                        <td
                          key={date}
                          className="border-l border-zinc-200 py-1.5 text-center"
                          onClick={() => handleSlotClick(date, hour)}
                        >
                          <span
                            className={`inline-block w-full truncate rounded-md px-2 py-1 text-xs font-medium transition ${cellCls}`}
                          >
                            {label}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
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
