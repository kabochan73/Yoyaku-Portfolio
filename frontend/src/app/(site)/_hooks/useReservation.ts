import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";
import { useUser } from "@/hooks/useUser";
import { toYM } from "@/lib/date";

type ReservationInput = {
  date: string;
  startTime: string;
  endTime: string;
};

export function useReservation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submit = async ({ date, startTime, endTime }: ReservationInput) => {
    if (!user) {
      router.push("/login");
      return false;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/reservations", {
        date,
        start_time: startTime,
        end_time: endTime,
      });
      queryClient.invalidateQueries({ queryKey: ["calendar", toYM(new Date(`${date}T00:00:00`))] });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError("予約に失敗しました。時間をおいて再度お試しください。");
      }
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = () => setSubmitError(null);

  return { submit, submitting, submitError, clearError, isLoggedIn: !!user };
}
