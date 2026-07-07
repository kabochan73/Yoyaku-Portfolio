import { render, screen, fireEvent } from "@testing-library/react";
import { UserSearchPanel } from "./UserSearchPanel";
import { useAdminUsers } from "../_hooks/useAdminUsers";

jest.mock("../_hooks/useAdminUsers", () => ({
  useAdminUsers: jest.fn(),
}));

const mockedUseAdminUsers = useAdminUsers as jest.Mock;

describe("UserSearchPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("入力するとsetSearchが呼ばれる", () => {
    const setSearch = jest.fn();
    mockedUseAdminUsers.mockReturnValue({
      search: "",
      setSearch,
      users: undefined,
      isLoading: false,
      hasSearched: false,
    });
    render(<UserSearchPanel />);

    fireEvent.change(screen.getByPlaceholderText("名前またはメールアドレスで検索"), {
      target: { value: "山田" },
    });

    expect(setSearch).toHaveBeenCalledWith("山田");
  });

  it("検索中はローディング表示を出す", () => {
    mockedUseAdminUsers.mockReturnValue({
      search: "山田",
      setSearch: jest.fn(),
      users: undefined,
      isLoading: true,
      hasSearched: true,
    });
    const { container } = render(<UserSearchPanel />);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("検索結果が0件の場合は案内文を表示する", () => {
    mockedUseAdminUsers.mockReturnValue({
      search: "存在しない",
      setSearch: jest.fn(),
      users: [],
      isLoading: false,
      hasSearched: true,
    });
    render(<UserSearchPanel />);
    expect(screen.getByText("ユーザーが見つかりませんでした")).toBeInTheDocument();
  });

  it("検索結果一覧を表示する", () => {
    mockedUseAdminUsers.mockReturnValue({
      search: "山田",
      setSearch: jest.fn(),
      users: [
        {
          id: 1,
          name: "山田太郎",
          email: "yamada@example.com",
          created_at: "2026-01-01",
          reservations_count: 3,
        },
      ],
      isLoading: false,
      hasSearched: true,
    });
    render(<UserSearchPanel />);
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("yamada@example.com")).toBeInTheDocument();
    expect(screen.getByText("予約 3件")).toBeInTheDocument();
  });
});
