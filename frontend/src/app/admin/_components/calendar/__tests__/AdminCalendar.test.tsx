import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { AdminCalendar } from "../AdminCalendar";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";
import { HOURS } from "@/lib/date";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

jest.mock("@/lib/echo", () => ({
  getEcho: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetEcho = getEcho as jest.Mock;

// 2026-07-08は水曜日。週の月曜(2026-07-06)〜日曜(2026-07-12)が表示される。
// 2026-07-06/07は「today(07-08)より前」の過去日として扱われる。
const CALENDAR_DATA = {
  "2026-07-06": { closed: false, slots: { "10": "available" } }, // 過去日・空き
  "2026-07-08": {
    closed: false,
    slots: { "10": "available", "11": "available", "14": "booked" },
  },
};
const RESERVATIONS = [
  {
    id: 1,
    date: "2026-07-08",
    start_time: "14:00",
    end_time: "15:00",
    booker_name: "山田太郎",
    price: 4000,
    user_id: null,
  },
];
const PRICES = [
  { type: "weekday", amount_per_hour: 4000 },
  { type: "weekend", amount_per_hour: 5000 },
];

function mockApiResponses() {
  mockedApi.get.mockImplementation((url: string) => {
    if (url.startsWith("/calendar")) return Promise.resolve({ data: CALENDAR_DATA });
    if (url.startsWith("/admin/reservations")) return Promise.resolve({ data: RESERVATIONS });
    if (url === "/prices") return Promise.resolve({ data: PRICES });
    return Promise.reject(new Error(`unexpected url: ${url}`));
  });
}

function clickSlot(container: HTMLElement, hour: number, dayIndex: number) {
  const hourIndex = HOURS.indexOf(hour);
  const row = container.querySelectorAll("tbody tr")[hourIndex];
  const cell = row.querySelectorAll("td")[dayIndex + 1];
  cell.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

function renderCalendar() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AdminCalendar />
    </QueryClientProvider>,
  );
}

describe("AdminCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({
      doNotFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "nextTick", "queueMicrotask"],
    });
    jest.setSystemTime(new Date(2026, 6, 8)); // 2026-07-08(水)
    mockedGetEcho.mockReturnValue(null);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("予約済みマスに予約者名を表示する", async () => {
    mockApiResponses();
    renderCalendar();

    expect(await screen.findByText("山田太郎")).toBeInTheDocument();
  });

  it("予約済みマスをクリックすると詳細モーダルが開く", async () => {
    mockApiResponses();
    const { container } = renderCalendar();
    await screen.findByText("山田太郎");

    act(() => clickSlot(container, 14, 2)); // 2026-07-08(水)14時 = 予約済み

    expect(await screen.findByText("予約詳細")).toBeInTheDocument();
    expect(screen.getAllByText("山田太郎").length).toBeGreaterThan(0);
    expect(screen.getByText("¥4,000")).toBeInTheDocument();
  });

  it("詳細モーダルでキャンセルするとAPIが呼ばれモーダルが閉じる", async () => {
    mockApiResponses();
    mockedApi.delete.mockResolvedValueOnce({ data: {} });
    const { container } = renderCalendar();
    await screen.findByText("山田太郎");

    act(() => clickSlot(container, 14, 2));
    await screen.findByText("予約詳細");

    await act(async () => {
      screen.getByText("キャンセルする").click();
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/admin/reservations/1");
    await waitFor(() => expect(screen.queryByText("予約詳細")).not.toBeInTheDocument());
  });

  it("空きマスを2つ選ぶと電話予約登録モーダルが開き、登録するとAPIが呼ばれる", async () => {
    mockApiResponses();
    mockedApi.post.mockResolvedValueOnce({ data: {} });
    const { container } = renderCalendar();
    await screen.findByText("山田太郎");

    act(() => clickSlot(container, 10, 2)); // 2026-07-08(水)10時 = 開始
    act(() => clickSlot(container, 11, 2)); // 11時 = 終了(2時間)

    expect(await screen.findByText("電話予約の登録")).toBeInTheDocument();

    const bookerNameInput = screen.getByText("予約者名").nextElementSibling as HTMLElement;
    fireEvent.change(bookerNameInput, { target: { value: "田中花子" } });

    await act(async () => {
      screen.getByText("登録する").click();
    });

    expect(mockedApi.post).toHaveBeenCalledWith("/admin/reservations", {
      date: "2026-07-08",
      start_time: "10:00",
      end_time: "12:00",
      booker_name: "田中花子",
    });
    await waitFor(() => expect(screen.queryByText("電話予約の登録")).not.toBeInTheDocument());
  });

  it("過去日の空きマスをクリックしても新規選択は開始されない", async () => {
    mockApiResponses();
    const { container } = renderCalendar();
    await screen.findByText("山田太郎");

    act(() => clickSlot(container, 10, 0)); // 2026-07-06(月、過去日)の空きマス

    expect(screen.queryByText("電話予約の登録")).not.toBeInTheDocument();
  });
});
