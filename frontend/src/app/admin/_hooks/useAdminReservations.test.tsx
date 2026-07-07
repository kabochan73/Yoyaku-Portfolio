import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useAdminReservations, type AdminReservation } from "./useAdminReservations";
import { api } from "@/lib/axios";
import { getEcho } from "@/lib/echo";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), post: jest.fn(), delete: jest.fn() },
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

const reservation: AdminReservation = {
  id: 1,
  date: "2026-07-08",
  start_time: "10:00",
  end_time: "12:00",
  booker_name: "山田太郎",
  price: 6000,
  user_id: null,
};

describe("useAdminReservations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetEcho.mockReturnValue(null);
  });

  it("取得した予約からgetReservationで該当時間帯の予約を返す", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [reservation] });

    const { result } = renderHook(() => useAdminReservations(["2026-07"]), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.allReservations).toHaveLength(1));
    expect(result.current.getReservation("2026-07-08", 10)).toEqual(reservation);
    expect(result.current.getReservation("2026-07-08", 12)).toBeNull();
    expect(result.current.getReservation("2026-07-09", 10)).toBeNull();
  });

  it("キャンセルに成功する", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [reservation] });
    mockedApi.delete.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminReservations(["2026-07"]), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.allReservations).toHaveLength(1));

    await act(async () => {
      await result.current.cancel(reservation);
    });

    expect(mockedApi.delete).toHaveBeenCalledWith("/admin/reservations/1");
    expect(result.current.cancelError).toBeNull();
  });

  it("電話予約の作成に成功するとtrueを返す", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.post.mockResolvedValueOnce({ data: {} });

    const { result } = renderHook(() => useAdminReservations(["2026-07"]), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.allReservations).toHaveLength(0));

    let success!: boolean;
    await act(async () => {
      success = await result.current.create({
        date: "2026-07-08",
        startTime: "10:00",
        endTime: "12:00",
        bookerName: "田中花子",
      });
    });

    expect(success).toBe(true);
    expect(mockedApi.post).toHaveBeenCalledWith("/admin/reservations", {
      date: "2026-07-08",
      start_time: "10:00",
      end_time: "12:00",
      booker_name: "田中花子",
    });
  });

  it("電話予約の作成が422エラーの場合はサーバーのメッセージをcreateErrorにセットする", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: [] });
    mockedApi.post.mockRejectedValueOnce(
      new AxiosError("Unprocessable", "422", undefined, undefined, {
        status: 422,
        data: { message: "その時間は既に予約されています" },
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      }),
    );

    const { result } = renderHook(() => useAdminReservations(["2026-07"]), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.allReservations).toHaveLength(0));

    await act(async () => {
      await result.current.create({
        date: "2026-07-08",
        startTime: "10:00",
        endTime: "12:00",
        bookerName: "田中花子",
      });
    });

    expect(result.current.createError).toBe("その時間は既に予約されています");
  });
});
