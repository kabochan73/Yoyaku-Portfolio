export type SlotStatus = "available" | "booked" | "closed";

export type CalendarData = Record<string, { closed: boolean; slots: Record<string, string> }>;

export type Price = { type: "weekday" | "weekend"; amount_per_hour: number };

export type ReservationDetails = {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  total: number;
  dateLabel: string;
};
