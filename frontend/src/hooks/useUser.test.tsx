import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import type { ReactNode } from "react";
import { useUser } from "./useUser";
import { api, getCsrfCookie } from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn(), post: jest.fn(), put: jest.fn() },
  getCsrfCookie: jest.fn(),
}));

const mockedApi = api as jest.Mocked<typeof api>;
const mockedGetCsrfCookie = getCsrfCookie as jest.Mock;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("ログイン済みならユーザー情報を取得できる", async () => {
    const user = { id: 1, name: "太郎", email: "taro@example.com", role: "user" as const };
    mockedApi.get.mockResolvedValueOnce({ data: user });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toEqual(user);
  });

  it("未ログイン(401)ならuserはnullになる", async () => {
    mockedApi.get.mockRejectedValueOnce(
      new AxiosError("Unauthorized", "401", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      }),
    );

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("loginに成功するとCSRF cookie取得後にログインしキャッシュへ反映される", async () => {
    mockedApi.get.mockRejectedValueOnce(
      new AxiosError("Unauthorized", "401", undefined, undefined, {
        status: 401,
        data: {},
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      }),
    );
    const user = { id: 1, name: "太郎", email: "taro@example.com", role: "user" as const };
    mockedApi.post.mockResolvedValueOnce({ data: user });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.login({ email: "taro@example.com", password: "password" });

    expect(mockedGetCsrfCookie).toHaveBeenCalledTimes(1);
    expect(mockedApi.post).toHaveBeenCalledWith("/login", {
      email: "taro@example.com",
      password: "password",
    });
    await waitFor(() => expect(result.current.user).toEqual(user));
  });

  it("logoutに成功するとキャッシュがnullになる", async () => {
    const user = { id: 1, name: "太郎", email: "taro@example.com", role: "user" as const };
    mockedApi.get.mockResolvedValueOnce({ data: user });
    mockedApi.post.mockResolvedValueOnce({ data: null });

    const { result } = renderHook(() => useUser(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.user).toEqual(user));

    result.current.logout();

    await waitFor(() => expect(result.current.user).toBeNull());
  });
});
