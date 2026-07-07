import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { useAdminUsers } from "./useAdminUsers";
import { api } from "@/lib/axios";

jest.mock("@/lib/axios", () => ({
  api: { get: jest.fn() },
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

describe("useAdminUsers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("検索語が空の間はAPIを叩かない", () => {
    const { result } = renderHook(() => useAdminUsers(), { wrapper: createWrapper() });

    expect(result.current.hasSearched).toBe(false);
    expect(mockedApi.get).not.toHaveBeenCalled();
  });

  it("入力から300ms後にデバウンスされて検索が実行される", async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: [{ id: 1, name: "山田太郎", email: "yamada@example.com", created_at: "2026-01-01", reservations_count: 3 }],
    });

    const { result } = renderHook(() => useAdminUsers(), { wrapper: createWrapper() });

    act(() => {
      result.current.setSearch("山田");
    });
    expect(mockedApi.get).not.toHaveBeenCalled();

    await waitFor(() => expect(result.current.hasSearched).toBe(true), { timeout: 1000 });
    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenCalledWith("/admin/users?search=%E5%B1%B1%E7%94%B0"),
    );
    await waitFor(() => expect(result.current.users).toHaveLength(1));
  });
});
