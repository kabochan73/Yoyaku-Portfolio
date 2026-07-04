import { useEffect, useMemo } from "react";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";

type SlotStatus = "available" | "booked" | "closed";
type CalendarData = Record<string, { closed: boolean; slots: Record<string, string> }>;

export function useCalendar(months: string[]) {
  const queryClient = useQueryClient();

  const results = useQueries({
    queries: months.map((month) => ({
      queryKey: ["calendar", month],
      queryFn: async () => {
        const { data } = await api.get<CalendarData>(`/calendar?month=${month}`);
        return data;
      },
      refetchInterval: 10 * 60 * 1000,
    })),
  });

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel("calendar");
    channel.listen("ReservationUpdated", (e: { date: string }) => {
      const month = e.date.slice(0, 7);
      queryClient.invalidateQueries({ queryKey: ["calendar", month] });
    });

    return () => {
      echo.leaveChannel("calendar");
    };
  }, [queryClient]);

  const calendarData = useMemo<CalendarData>(
    () => results.reduce((acc, r) => (r.data ? { ...acc, ...r.data } : acc), {}),
    [results],
  );

  const isLoading = Object.keys(calendarData).length === 0;

  const getSlotStatus = (date: string, hour: number): SlotStatus => {
    const day = calendarData[date];
    if (!day || day.closed) return "closed";
    return (day.slots[String(hour)] as SlotStatus) ?? "closed";
  };

  return { isLoading, getSlotStatus };
}
