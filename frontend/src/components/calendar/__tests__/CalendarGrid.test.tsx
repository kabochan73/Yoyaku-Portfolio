import { render, screen } from "@testing-library/react";
import { CalendarGrid } from "../CalendarGrid";
import { HOURS } from "@/lib/date";

const weekDays = Array.from({ length: 7 }, (_, i) => new Date(2026, 6, 6 + i)); // 2026-07-06(月)〜07-12(日)
const today = new Date(2026, 6, 6);

function baseProps() {
  return {
    weekDays,
    today,
    isLoading: false,
    getSlotStatus: () => "closed" as const,
    selectedStart: null,
    isValidEnd: () => false,
    onSlotClick: () => {},
  };
}

describe("CalendarGrid", () => {
  it("曜日ヘッダーと日付を表示する", () => {
    render(<CalendarGrid {...baseProps()} />);

    expect(screen.getByText("月")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getAllByText("6")).toHaveLength(1);
  });

  it("isLoadingの間はローディング表示を出す", () => {
    render(<CalendarGrid {...baseProps()} isLoading={true} />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("isLoadingがfalseならローディング表示は出ない", () => {
    render(<CalendarGrid {...baseProps()} isLoading={false} />);
    expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
  });

  it("特定のマスをクリックすると該当する日付・時間でonSlotClickが呼ばれる", () => {
    const onSlotClick = jest.fn();
    const { container } = render(<CalendarGrid {...baseProps()} onSlotClick={onSlotClick} />);

    const hourIndex = HOURS.indexOf(11); // 11時の行
    const dayIndex = 2; // weekDays[2] = 2026-07-08(水)

    const row = container.querySelectorAll("tbody tr")[hourIndex];
    const cell = row.querySelectorAll("td")[dayIndex + 1]; // 先頭列は時間ラベル
    cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(onSlotClick).toHaveBeenCalledWith("2026-07-08", 11);
  });
});
