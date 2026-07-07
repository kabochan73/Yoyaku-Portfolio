import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AxiosError } from "axios";
import { ProfileForm } from "../ProfileForm";
import { useUser, type User } from "@/hooks/useUser";

jest.mock("@/hooks/useUser", () => ({
  useUser: jest.fn(),
}));

const mockedUseUser = useUser as jest.Mock;

const user: User = { id: 1, name: "山田太郎", email: "yamada@example.com", role: "user" };

describe("ProfileForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在の名前・メールアドレスを初期値として表示する", () => {
    mockedUseUser.mockReturnValue({ updateProfile: jest.fn() });
    render(<ProfileForm user={user} />);

    expect(screen.getByDisplayValue("山田太郎")).toBeInTheDocument();
    expect(screen.getByDisplayValue("yamada@example.com")).toBeInTheDocument();
  });

  it("名前・メールのみ変更した場合はパスワード関連フィールド無しでupdateProfileが呼ばれる", async () => {
    const updateProfile = jest.fn().mockResolvedValue(user);
    mockedUseUser.mockReturnValue({ updateProfile });
    render(<ProfileForm user={user} />);

    fireEvent.change(screen.getByDisplayValue("山田太郎"), { target: { value: "田中花子" } });
    fireEvent.click(screen.getByText("更新する"));

    await waitFor(() =>
      expect(updateProfile).toHaveBeenCalledWith({
        name: "田中花子",
        email: "yamada@example.com",
      }),
    );
    expect(screen.getByText("プロフィールを更新しました。")).toBeInTheDocument();
  });

  it("新しいパスワードのみ入力すると現在のパスワード未入力のバリデーションエラーになる", async () => {
    mockedUseUser.mockReturnValue({ updateProfile: jest.fn() });
    render(<ProfileForm user={user} />);

    fireEvent.change(screen.getByPlaceholderText("8文字以上"), { target: { value: "newpassword" } });
    fireEvent.click(screen.getByText("更新する"));

    expect(await screen.findByText("現在のパスワードを入力してください")).toBeInTheDocument();
  });

  it("パスワード確認が一致しない場合はエラーになる", async () => {
    mockedUseUser.mockReturnValue({ updateProfile: jest.fn() });
    render(<ProfileForm user={user} />);

    const currentPasswordInput = screen.getByText("現在のパスワード").nextElementSibling as HTMLElement;
    const confirmationInput = screen.getByText("新しいパスワード（確認）")
      .nextElementSibling as HTMLElement;

    fireEvent.change(currentPasswordInput, { target: { value: "current123" } });
    fireEvent.change(screen.getByPlaceholderText("8文字以上"), { target: { value: "newpassword" } });
    fireEvent.change(confirmationInput, { target: { value: "mismatch" } });
    fireEvent.click(screen.getByText("更新する"));

    expect(await screen.findByText("パスワードが一致しません")).toBeInTheDocument();
  });

  it("サーバーが422を返した場合はメッセージを表示する", async () => {
    const updateProfile = jest.fn().mockRejectedValue(
      new AxiosError("Unprocessable", "422", undefined, undefined, {
        status: 422,
        data: { message: "このメールアドレスは既に使用されています" },
        statusText: "Unprocessable Entity",
        headers: {},
        config: {} as never,
      }),
    );
    mockedUseUser.mockReturnValue({ updateProfile });
    render(<ProfileForm user={user} />);

    fireEvent.click(screen.getByText("更新する"));

    expect(await screen.findByText("このメールアドレスは既に使用されています")).toBeInTheDocument();
  });
});
