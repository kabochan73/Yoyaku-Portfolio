import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

export type RegularHoliday = { day_of_week: number };

export function useAdminRegularHolidays() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { data: regularHolidays, isLoading } = useQuery({
    queryKey: ["admin-regular-holidays"],
    queryFn: async () => {
      const { data } = await api.get<RegularHoliday[]>("/admin/regular-holidays");
      return data;
    },
    staleTime: Infinity,
  });

  const update = async (days: number[]) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      await api.put("/admin/regular-holidays", { days });
      queryClient.invalidateQueries({ queryKey: ["admin-regular-holidays"] });
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      await fetch("/api/revalidate?tag=regular-holidays");
      setSaveSuccess(true);
    } catch {
      setSaveError("保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  return { regularHolidays, isLoading, update, saving, saveError, saveSuccess };
}
