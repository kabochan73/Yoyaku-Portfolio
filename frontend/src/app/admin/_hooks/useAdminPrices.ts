import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { api } from "@/lib/axios";

export type Price = { type: "weekday" | "weekend"; amount_per_hour: number };

export function useAdminPrices() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: prices, isLoading } = useQuery({
    queryKey: ["admin-prices"],
    queryFn: async () => {
      const { data } = await api.get<Price[]>("/admin/prices");
      return data;
    },
    staleTime: Infinity,
  });

  const update = async (weekday: number, weekend: number) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await api.put("/admin/prices", { weekday, weekend });
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      queryClient.invalidateQueries({ queryKey: ["prices"] });
      await fetch("/api/revalidate?tag=prices");
      setSaveSuccess(true);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setSaveError(error.response.data.message ?? "保存に失敗しました。");
      } else {
        setSaveError("保存に失敗しました。");
      }
    } finally {
      setSaving(false);
    }
  };

  return { prices, isLoading, update, saving, saveError, saveSuccess };
}
