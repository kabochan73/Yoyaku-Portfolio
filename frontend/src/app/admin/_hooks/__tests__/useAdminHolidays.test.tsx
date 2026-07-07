import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useAdminHolidays } from "../useAdminHolidays";
import { api } from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function conflict(count: number, message: string) {
  return new AxiosError("Conflict", "409", undefined, undefined, {
    status: 409,
    data: { warning: true, count, message },
    statusText: "Conflict",
    headers: {},
    config: {} as never,
  });
}

describe("useAdminHolidays", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("休日一覧を取得できる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ id: 1, date: "2026-07-15", reason: "臨時休業" }] });

    const { result } = renderHook(() => useAdminHolidays(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.holidays).toHaveLength(1);
  });

  it("追加に成功するとtrueを返す", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success!: boolean;
    await act(async () => {
      success = await result.current.add({ date: "2026-07-15", reason: "臨時休業" });
    });

    expect(success).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith("/admin/holidays", {
      date: "2026-07-15",
      reason: "臨時休業",
      force: false,
    });
    expect(result.current.warning).toBeNull();
  });

  it("予約がある日は409警告が出てwarningにセットされる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.post.mockRejectedValueOnce(conflict(2, "この日には2件の予約があります"));

    const { result } = renderHook(() => useAdminHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let success!: boolean;
    await act(async () => {
      success = await result.current.add({ date: "2026-07-15", reason: "臨時休業" });
    });

    expect(success).toBe(false);
    expect(result.current.warning).toEqual({ count: 2, message: "この日には2件の予約があります" });
  });

  it("confirmWithForceで直前の入力内容がforce=trueで再送される", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.post.mockRejectedValueOnce(conflict(2, "この日には2件の予約があります"));
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.add({ date: "2026-07-15", reason: "臨時休業" });
    });
    expect(result.current.warning).not.toBeNull();

    await act(async () => {
      result.current.confirmWithForce();
    });

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenLastCalledWith("/admin/holidays", {
        date: "2026-07-15",
        reason: "臨時休業",
        force: true,
      }),
    );
    await waitFor(() => expect(result.current.warning).toBeNull());
  });

  it("削除できる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.remove(1);
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/admin/holidays/1");
    expect(result.current.removing).toBeNull();
  });
});
