import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HolidayPanel } from "../HolidayPanel";
import { useAdminHolidays } from "../../_hooks/useAdminHolidays";

jest.mock("../../_hooks/useAdminHolidays", () => ({
  useAdminHolidays: jest.fn(),
}));

const mockedUseAdminHolidays = useAdminHolidays as jest.Mock;

function baseReturn(overrides = {}) {
  return {
    holidays: [],
    isLoading: false,
    add: jest.fn().mockResolvedValue(true),
    adding: false,
    addError: null,
    warning: null,
    confirmWithForce: jest.fn(),
    dismissWarning: jest.fn(),
    remove: jest.fn(),
    removing: null,
    ...overrides,
  };
}

describe("HolidayPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("休業日が無い場合は案内文を表示する", () => {
    mockedUseAdminHolidays.mockReturnValue(baseReturn());
    render(<HolidayPanel />);
    expect(screen.getByText("登録された休業日はありません")).toBeInTheDocument();
  });

  it("休業日一覧を表示し、削除ボタンでremoveが呼ばれる", () => {
    const remove = jest.fn();
    mockedUseAdminHolidays.mockReturnValue(
      baseReturn({
        holidays: [{ id: 1, date: "2026-07-15", reason: "設備メンテナンス" }],
        remove,
      }),
    );
    render(<HolidayPanel />);

    expect(screen.getByText("2026-07-15")).toBeInTheDocument();
    expect(screen.getByText("— 設備メンテナンス")).toBeInTheDocument();

    fireEvent.click(screen.getByText("削除"));
    expect(remove).toHaveBeenCalledWith(1);
  });

  it("追加フォームの入力内容でaddが呼ばれる", async () => {
    const add = jest.fn().mockResolvedValue(true);
    mockedUseAdminHolidays.mockReturnValue(baseReturn({ add }));
    render(<HolidayPanel />);

    const dateInput = screen.getByText("日付").nextElementSibling as HTMLElement;
    fireEvent.change(dateInput, { target: { value: "2026-07-15" } });
    fireEvent.change(screen.getByPlaceholderText("例：設備メンテナンス"), {
      target: { value: "設備メンテナンス" },
    });
    fireEvent.click(screen.getByText("休業日を追加"));

    await waitFor(() =>
      expect(add).toHaveBeenCalledWith({ date: "2026-07-15", reason: "設備メンテナンス" }),
    );
  });

  it("409警告が出ている場合は確認モーダルを表示し、強制設定するでconfirmWithForceが呼ばれる", () => {
    const confirmWithForce = jest.fn();
    mockedUseAdminHolidays.mockReturnValue(
      baseReturn({
        warning: { count: 2, message: "この日には2件の予約があります" },
        confirmWithForce,
      }),
    );
    render(<HolidayPanel />);

    expect(screen.getByText("この日には2件の予約があります")).toBeInTheDocument();
    fireEvent.click(screen.getByText("強制設定する"));
    expect(confirmWithForce).toHaveBeenCalledTimes(1);
  });

  it("警告モーダルのキャンセルでdismissWarningが呼ばれる", () => {
    const dismissWarning = jest.fn();
    mockedUseAdminHolidays.mockReturnValue(
      baseReturn({
        warning: { count: 2, message: "この日には2件の予約があります" },
        dismissWarning,
      }),
    );
    render(<HolidayPanel />);

    fireEvent.click(screen.getByText("キャンセル"));
    expect(dismissWarning).toHaveBeenCalledTimes(1);
  });
});
