import { DAY_LABELS, HOURS, toYMD } from "../../_utils/date";
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
};

export function CalendarGrid({
  weekDays,
  today,
  isLoading,
  getSlotStatus,
  selectedStart,
  isValidEnd,
  onSlotClick,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-sm text-zinc-400">
          読み込み中...
        </div>
      ) : (
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="w-28 py-3 text-center text-xs font-medium text-zinc-500">
                時間
              </th>
              {weekDays.map((d) => {
                const dow = d.getDay();
                const isToday = toYMD(d) === toYMD(today);
                const color =
                  dow === 6 ? "text-blue-600" : dow === 0 ? "text-red-500" : "text-zinc-700";
                return (
                  <th key={toYMD(d)} className="py-3 text-center">
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
                  return (
                    <SlotCell
                      key={date}
                      status={getSlotStatus(date, hour)}
                      isStart={selectedStart?.date === date && selectedStart?.hour === hour}
                      canBeEnd={isValidEnd(date, hour)}
                      onClick={() => onSlotClick(date, hour)}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
