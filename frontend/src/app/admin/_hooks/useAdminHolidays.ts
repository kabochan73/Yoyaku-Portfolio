import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";

export type Holiday = {
  id: number;
  date: string;
  reason: string | null;
};

type HolidayWarning = {
  count: number;
  message: string;
};

export function useAdminHolidays() {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [warning, setWarning] = useState<HolidayWarning | null>(null);
  const [pendingData, setPendingData] = useState<{ date: string; reason: string } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  const { data: holidays, isLoading } = useQuery({
    queryKey: ["admin-holidays"],
    queryFn: async () => {
      const { data } = await api.get<Holiday[]>("/admin/holidays");
      return data;
    },
    staleTime: Infinity,
  });

  const add = async (data: { date: string; reason: string }, force = false) => {
    setAdding(true);
    setAddError(null);
    try {
      await api.post("/admin/holidays", { ...data, force });
      queryClient.invalidateQueries({ queryKey: ["admin-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setWarning(null);
      setPendingData(null);
      return true;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409 && error.response.data?.warning) {
        setWarning({ count: error.response.data.count, message: error.response.data.message });
        setPendingData(data);
      } else if (error instanceof AxiosError && error.response?.status === 422) {
        setAddError(error.response.data.message ?? "登録に失敗しました。");
      } else {
        setAddError("登録に失敗しました。");
      }
      return false;
    } finally {
      setAdding(false);
    }
  };

  const confirmWithForce = () => {
    if (pendingData) add(pendingData, true);
  };

  const dismissWarning = () => {
    setWarning(null);
    setPendingData(null);
  };

  const remove = async (id: number) => {
    setRemoving(id);
    try {
      await api.delete(`/admin/holidays/${id}`);
      queryClient.invalidateQueries({ queryKey: ["admin-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
    } finally {
      setRemoving(null);
    }
  };

  return {
    holidays,
    isLoading,
    add,
    adding,
    addError,
    clearAddError: () => setAddError(null),
    warning,
    confirmWithForce,
    dismissWarning,
    remove,
    removing,
  };
}
