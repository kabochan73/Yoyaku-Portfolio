import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, act } from "@testing-library/react";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";
import { useUser } from "@/hooks/useUser";
import { HOURS } from "@/lib/date";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

jest.mock("@/lib/echo", () => ({
  getEcho: jest.fn(),
}));

jest.mock("@/hooks/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetEcho = getEcho as jest.Mock;
const mockedUseUser = useUser as jest.Mock;

// 2026-07-08は水曜日。週の月曜(2026-07-06)〜日曜(2026-07-12)が表示される
const CALENDAR_DATA = {
  "2026-07-08": {
    closed: false,
    slots: { "10": "available", "11": "available", "12": "booked" },
  },
};
const PRICES = [
  { type: "weekday", amount_per_hour: 4000 },
  { type: "weekend", amount_per_hour: 5000 },
];

function mockApiResponses() {
  mockedApi.get.mockImplementation((url: string) => {
    if (url.startsWith("/calendar")) return Promise.resolve({ data: CALENDAR_DATA });
    if (url === "/prices") return Promise.resolve({ data: PRICES });
    return Promise.reject(new Error(`unexpected url: ${url}`));
  });
}

function clickSlot(container: HTMLElement, hour: number, dayIndex: number) {
  const hourIndex = HOURS.indexOf(hour);
  const row = container.querySelectorAll("tbody tr")[hourIndex];
  const cell = row.querySelectorAll("td")[dayIndex + 1]; // 先頭列は時間ラベル
  cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function renderCalendar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <WeeklyCalendar />
    </QueryClientProvider>,
  );
}

describe("WeeklyCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({
      doNotFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "nextTick", "queueMicrotask"],
    });
    jest.setSystemTime(new Date(2026, 6, 8)); // 2026-07-08(水)
    mockedGetEcho.mockReturnValue(null);
    mockedUseUser.mockReturnValue({ user: { id: 1, name: "太郎" } });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("週のカレンダーと空き状況を表示する", async () => {
    mockApiResponses();
    const { container } = renderCalendar();

    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());
    expect(screen.getByText("7/6 〜 7/12")).toBeInTheDocument();
    expect(container.querySelectorAll("td").length).toBeGreaterThan(0);
  });

  it("開始・終了スロットを選ぶと平日料金で合計金額を計算し確認モーダルを開く", async () => {
    mockApiResponses();
    const { container } = renderCalendar();
    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());

    act(() => clickSlot(container, 10, 2)); // 2026-07-08(水) 10時 = 開始
    act(() => clickSlot(container, 11, 2)); // 同日11時 = 終了(2時間)

    expect(await screen.findByText("予約内容の確認")).toBeInTheDocument();
    expect(screen.getByText("10:00 〜 12:00")).toBeInTheDocument();
    expect(screen.getByText("2時間")).toBeInTheDocument();
    expect(screen.getByText("¥8,000")).toBeInTheDocument(); // 平日4000円 x 2時間
  });

  it("予約するボタンで送信し、成功するとモーダルが閉じる", async () => {
    mockApiResponses();
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    const { container } = renderCalendar();
    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());

    act(() => clickSlot(container, 10, 2));
    act(() => clickSlot(container, 11, 2));
    await screen.findByText("予約内容の確認");

    await act(async () => {
      screen.getByText("予約する").click();
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/reservations", {
      date: "2026-07-08",
      start_time: "10:00",
      end_time: "12:00",
    });
    await waitFor(() => expect(screen.queryByText("予約内容の確認")).not.toBeInTheDocument());
  });

  it("予約済みのマスをクリックしても選択は開始されない", async () => {
    mockApiResponses();
    const { container } = renderCalendar();
    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());

    act(() => clickSlot(container, 12, 2)); // booked
    act(() => clickSlot(container, 13, 2)); // 何もなければavailable扱いだが基準点が無いため何も起きない

    expect(screen.queryByText("予約内容の確認")).not.toBeInTheDocument();
  });

  it("現在の週では「前の週」ボタンが無効になっている", async () => {
    mockApiResponses();
    renderCalendar();
    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());

    expect(screen.getByText("← 前の週")).toHaveAttribute("aria-disabled", "true");
  });

  it("「次の週」を押すと表示される週が切り替わる", async () => {
    mockApiResponses();
    renderCalendar();
    await waitFor(() => expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument());

    act(() => {
      screen.getByText("次の週 →").click();
    });

    await waitFor(() => expect(screen.getByText("7/13 〜 7/19")).toBeInTheDocument());
  });
});
