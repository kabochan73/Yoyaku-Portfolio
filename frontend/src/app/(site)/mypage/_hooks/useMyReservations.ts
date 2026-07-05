import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type Reservation = {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  status: "confirmed" | "cancelled";
  price: number;
};

export function useMyReservations() {
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["my-reservations"],
    queryFn: async () => {
      const { data } = await api.get<Reservation[]>("/my-reservations");
      return data;
    },
  });

  const cancel = async (reservation: Reservation) => {
    setCancelling(reservation.id);
    setCancelError(null);
    try {
      await api.delete(`/reservations/${reservation.id}`);
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["calendar", reservation.date.slice(0, 7)] });
    } catch {
      setCancelError("キャンセルに失敗しました。もう一度お試しください。");
    } finally {
      setCancelling(null);
    }
  };

  return {
    reservations: query.data ?? [],
    isLoading: query.isLoading,
    cancel,
    cancelling,
    cancelError,
    clearCancelError: () => setCancelError(null),
  };
}
