import { useEffect, useMemo, useState } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";

export type AdminReservation = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  booker_name: string;
  price: number;
  user_id: number | null;
};

export function useAdminReservations(months: string[]) {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: ["admin-reservations", month],
      queryFn: async () => {
        const { data } = await api.get<AdminReservation[]>(`/admin/reservations?month=${month}`);
        return data;
      },
      staleTime: Infinity,
    })),
  });

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel("calendar");
    channel.listen("ReservationUpdated", (e: { date: string }) => {
      const month = e.date.slice(0, 7);
      queryClient.invalidateQueries({ queryKey: ["admin-reservations", month] });
    });

    return () => {
      echo.leaveChannel("calendar");
    };
  }, [queryClient]);

  const allReservations = useMemo(() => results.flatMap((r) => r.data ?? []), [results]);

  const getReservation = (date: string, hour: number): AdminReservation | null => {
    return (
      allReservations.find((r) => {
        if (r.date !== date) return false;
        const startHour = Number(r.start_time.slice(0, 2));
        const endHour = Number(r.end_time.slice(0, 2));
        return hour >= startHour && hour < endHour;
      }) ?? null
    );
  };

  const cancel = async (reservation: AdminReservation) => {
    setCancelling(reservation.id);
    setCancelError(null);
    try {
      await api.delete(`/admin/reservations/${reservation.id}`);
      const month = reservation.date.slice(0, 7);
      queryClient.invalidateQueries({ queryKey: ["admin-reservations", month] });
      queryClient.invalidateQueries({ queryKey: ["calendar", month] });
    } catch {
      setCancelError("キャンセルに失敗しました。");
    } finally {
      setCancelling(null);
    }
  };

  return {
    allReservations,
    getReservation,
    cancel,
    cancelling,
    cancelError,
    clearCancelError: () => setCancelError(null),
  };
}
