import { DAY_LABELS, HOURS, toYMD } from "@/lib/date";
import { SlotCell } from "./SlotCell";

type SlotStatus = "available" | "booked" | "closed";

type Props = {
  weekDays: Date[];
  today: Date;
  isLoading: boolean;
  getSlotStatus: (date: string, hour: number) => SlotStatus;
  selectedStart: { date: string; hour: number } | null;
  isValidEnd: (date: string, hour: number) => boolean;
  onSlotClick: (date: string, hour: number) => void;
  /** 予約済みマスをクリック可能にするか（admin: 詳細確認のため true） */
  bookedClickable?: boolean;
  /** 予約済みマスのラベルを個別に指定（admin: 予約者名を表示） */
  getBookedLabel?: (date: string, hour: number) => string | undefined;
};

export function CalendarGrid({
  weekDays,
  today,
  isLoading,
  getSlotStatus,
  selectedStart,
  isValidEnd,
  onSlotClick,
  bookedClickable,
  getBookedLabel,
}: Props) {
  return (
    <div className="relative overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xl">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 text-sm text-zinc-400">
          読み込み中...
        </div>
      )}
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="divide-x divide-zinc-200 border-b border-zinc-200 bg-white">
            <th className="w-14 py-3 text-center text-xl font-medium text-zinc-800 sm:w-28">
              時間
            </th>
            {weekDays.map((d) => {
              const dow = d.getDay();
              const isToday = toYMD(d) === toYMD(today);
              const color =
                dow === 6 ? "text-blue-600" : dow === 0 ? "text-red-500" : "text-zinc-700";
              return (
                <th key={toYMD(d)} className="py-3 text-center">
                  <div className={`text-xl font-semibold ${color}`}>{DAY_LABELS[dow]}</div>
                  <div
                    className={`mx-auto mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-sm ${
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
            <tr key={hour} className="divide-x divide-zinc-200 border-b border-zinc-200 last:border-0">
              <td className="py-2 text-center text-xs text-zinc-800">
                <span className="sm:hidden">{String(hour).padStart(2, "0")}:00</span>
                <span className="hidden sm:inline">
                  {String(hour).padStart(2, "0")}:00〜{String(hour + 1).padStart(2, "0")}:00
                </span>
              </td>
              {weekDays.map((d) => {
                const date = toYMD(d);
                return (
                  <SlotCell
                    key={date}
                    status={getSlotStatus(date, hour)}
                    isStart={selectedStart?.date === date && selectedStart?.hour === hour}
                    canBeEnd={isValidEnd(date, hour)}
                    onClick={() => onSlotClick(date, hour)}
                    bookedClickable={bookedClickable}
                    bookedLabel={getBookedLabel?.(date, hour)}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
