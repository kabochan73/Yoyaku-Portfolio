import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useReservation } from "../useReservation";
import { api } from "@/lib/axios";
import { useUser } from "@/hooks/useUser";

const mockPush = jest.fn();

jest.mock("@/lib/axios", () => ({
  api: { post: jest.fn() },
}));

jest.mock("@/hooks/useUser", () => ({
  useUser: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedUseUser = useUser as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useReservation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("未ログインの場合はloginへリダイレクトし送信しない", async () => {
    mockedUseUser.mockReturnValue({ user: null });

    const { result } = renderHook(() => useReservation(), { wrapper: createWrapper() });

    let success!: boolean;
    await act(async () => {
      success = await result.current.submit({
        date: "2026-07-08",
        startTime: "10:00",
        endTime: "12:00",
      });
    });

    expect(success).toBe(false);
    expect(mockPush).toHaveBeenCalledWith("/login");
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("ログイン済みなら予約APIを叩き成功時trueを返す", async () => {
    mockedUseUser.mockReturnValue({ user: { id: 1, name: "太郎" } });
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useReservation(), { wrapper: createWrapper() });

    let success!: boolean;
    await act(async () => {
      success = await result.current.submit({
        date: "2026-07-08",
        startTime: "10:00",
        endTime: "12:00",
      });
    });

    expect(success).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith("/reservations", {
      date: "2026-07-08",
      start_time: "10:00",
      end_time: "12:00",
    });
    expect(result.current.submitError).toBeNull();
  });

  it("422エラー時はサーバーのメッセージをsubmitErrorにセットする", async () => {
    mockedUseUser.mockReturnValue({ user: { id: 1, name: "太郎" } });
    mockedApi.post.mockRejectedValueOnce(
      new AxiosError("Unprocessable", "422", undefined, undefined, {
        status: 422,
        data: { message: "その時間は既に予約されています" },
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      }),
    );

    const { result } = renderHook(() => useReservation(), { wrapper: createWrapper() });

    let success!: boolean;
    await act(async () => {
      success = await result.current.submit({
        date: "2026-07-08",
        startTime: "10:00",
        endTime: "12:00",
      });
    });

    expect(success).toBe(false);
    expect(result.current.submitError).toBe("その時間は既に予約されています");
  });

  it("その他のエラー時は汎用エラーメッセージをセットする", async () => {
    mockedUseUser.mockReturnValue({ user: { id: 1, name: "太郎" } });
    mockedApi.post.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useReservation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.submit({ date: "2026-07-08", startTime: "10:00", endTime: "12:00" });
    });

    expect(result.current.submitError).toBe(
      "予約に失敗しました。時間をおいて再度お試しください。",
    );
  });

  it("clearErrorでsubmitErrorがリセットされる", async () => {
    mockedUseUser.mockReturnValue({ user: { id: 1, name: "太郎" } });
    mockedApi.post.mockRejectedValueOnce(new Error("network error"));

    const { result } = renderHook(() => useReservation(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.submit({ date: "2026-07-08", startTime: "10:00", endTime: "12:00" });
    });
    expect(result.current.submitError).not.toBeNull();

    act(() => {
      result.current.clearError();
    });
    expect(result.current.submitError).toBeNull();
  });
});
