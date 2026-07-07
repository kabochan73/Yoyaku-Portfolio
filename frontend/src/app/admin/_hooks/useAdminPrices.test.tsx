import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useAdminPrices } from "./useAdminPrices";
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

describe("useAdminPrices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn().mockResolvedValue({});
  });

  it("料金一覧を取得できる", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [
        { type: "weekday", amount_per_hour: 4000 },
        { type: "weekend", amount_per_hour: 5000 },
      ],
    });

    const { result } = renderHook(() => useAdminPrices(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.prices).toHaveLength(2);
  });

  it("更新に成功するとsaveSuccessがtrueになりrevalidateも呼ばれる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.put.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminPrices(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.update(4000, 5000);
    });

    expect(mockedApi.put).toHaveBeenCalledWith("/admin/prices", { weekday: 4000, weekend: 5000 });
    expect(global.fetch).toHaveBeenCalledWith("/api/revalidate?tag=prices");
    expect(result.current.saveSuccess).toBe(true);
    expect(result.current.saveError).toBeNull();
  });

  it("422エラー時はサーバーのメッセージをsaveErrorにセットする", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.put.mockRejectedValueOnce(
      new AxiosError("Unprocessable", "422", undefined, undefined, {
        status: 422,
        data: { message: "料金は0円より大きくしてください" },
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      }),
    );

    const { result } = renderHook(() => useAdminPrices(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.update(-1, 5000);
    });

    expect(result.current.saveError).toBe("料金は0円より大きくしてください");
    expect(result.current.saveSuccess).toBe(false);
  });
});
