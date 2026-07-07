import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAdminRegularHolidays } from "./useAdminRegularHolidays";
import { api } from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), put: jest.fn() },
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

describe("useAdminRegularHolidays", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({});
  });

  it("定休日一覧を取得できる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [{ day_of_week: 1 }] });

    const { result } = renderHook(() => useAdminRegularHolidays(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.regularHolidays).toEqual([{ day_of_week: 1 }]);
  });

  it("更新に成功するとsaveSuccessがtrueになりrevalidateも呼ばれる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.put.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminRegularHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.update([1, 2]);
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/admin/regular-holidays", { days: [1, 2] });
    expect(global.fetch).toHaveBeenCalledWith("/api/revalidate?tag=regular-holidays");
    expect(result.current.saveSuccess).toBe(true);
  });

  it("更新に失敗するとsaveErrorがセットされる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.put.mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useAdminRegularHolidays(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.update([1]);
    });

    expect(result.current.saveError).toBe("保存に失敗しました。");
    expect(result.current.saveSuccess).toBe(false);
  });
});
