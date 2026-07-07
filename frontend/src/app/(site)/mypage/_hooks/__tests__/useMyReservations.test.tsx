import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useMyReservations, type Reservation } from "../useMyReservations";
import { api } from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), delete: jest.fn() },
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

const reservation: Reservation = {
  id: 1,
  date: "2026-07-08",
  start_time: "10:00",
  end_time: "12:00",
  status: "confirmed",
  price: 6000,
};

describe("useMyReservations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("予約一覧を取得できる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [reservation] });

    const { result } = renderHook(() => useMyReservations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservations).toEqual([reservation]);
  });

  it("キャンセルに成功するとcancelErrorが出ない", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [reservation] });
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useMyReservations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.cancel(reservation);
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/reservations/1");
    expect(result.current.cancelError).toBeNull();
    expect(result.current.cancelling).toBeNull();
  });

  it("キャンセルに失敗するとcancelErrorがセットされる", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [reservation] });
    mockedApi.delete.mockRejectedValueOnce(new Error("failed"));

    const { result } = renderHook(() => useMyReservations(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.cancel(reservation);
    });

    expect(result.current.cancelError).toBe(
      "キャンセルに失敗しました。もう一度お試しください。",
    );
  });
});
