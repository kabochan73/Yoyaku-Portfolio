import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useCalendar } from "../useCalendar";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn() },
}));

jest.mock("@/lib/echo", () => ({
  getEcho: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetEcho = getEcho as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCalendar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetEcho.mockReturnValue(null);
  });

  it("取得したカレンダーデータからスロットの状態を返す", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        "2026-07-08": { closed: false, slots: { "10": "available", "11": "booked" } },
      },
    });

    const { result } = renderHook(() => useCalendar(["2026-07"]), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getSlotStatus("2026-07-08", 10)).toBe("available");
    expect(result.current.getSlotStatus("2026-07-08", 11)).toBe("booked");
  });

  it("データが無い日付はclosed扱いになる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useCalendar(["2026-07"]), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.getSlotStatus("2026-07-08", 10)).toBe("closed");
  });

  it("月またぎで一部の月が未取得の間はisLoadingがtrueのままになる", async () => {
    let resolveSecond!: (value: { data: Record<string, never> }) => void;
    mockedApi.get.mockImplementationOnce(() => Promise.resolve({ data: {} }));
    mockedApi.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSecond = resolve;
        }),
    );

    const { result } = renderHook(() => useCalendar(["2026-07", "2026-08"]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(mockedApi.get).toHaveBeenCalledTimes(2));
    expect(result.current.isLoading).toBe(true);

    resolveSecond({ data: {} });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it("ReservationUpdatedイベントは該当月のクエリだけを無効化する", async () => {
    mockedApi.get.mockResolvedValue({ data: {} });

    let handler!: (e: { date: string }) => void;
    const fakeEcho = {
      channel: jest.fn().mockReturnValue({
        listen: jest.fn((_event: string, cb: (e: { date: string }) => void) => {
          handler = cb;
        }),
      }),
      leaveChannel: jest.fn(),
    };
    mockedGetEcho.mockReturnValue(fakeEcho);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCalendar(["2026-07", "2026-08"]), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    handler({ date: "2026-08-05" });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["calendar", "2026-08"] });
  });
});
