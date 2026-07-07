import { render, screen, fireEvent } from "@testing-library/react";
import { RegularHolidayPanel } from "../RegularHolidayPanel";
import { useAdminRegularHolidays } from "../../_hooks/useAdminRegularHolidays";

jest.mock("../../_hooks/useAdminRegularHolidays", () => ({
  useAdminRegularHolidays: jest.fn(),
}));

const mockedUseAdminRegularHolidays = useAdminRegularHolidays as jest.Mock;

describe("RegularHolidayPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("読み込み中は読み込み中表示を出す", () => {
    mockedUseAdminRegularHolidays.mockReturnValue({
      regularHolidays: undefined,
      isLoading: true,
      update: jest.fn(),
      saving: false,
      saveError: null,
      saveSuccess: false,
    });
    render(<RegularHolidayPanel />);
    expect(screen.getByText("読み込み中...")).toBeInTheDocument();
  });

  it("現在の定休日が選択済み(赤色)で表示される", () => {
    mockedUseAdminRegularHolidays.mockReturnValue({
      regularHolidays: [{ day_of_week: 1 }],
      isLoading: false,
      update: jest.fn(),
      saving: false,
      saveError: null,
      saveSuccess: false,
    });
    render(<RegularHolidayPanel />);
    expect(screen.getByText("月")).toHaveClass("bg-red-500");
    expect(screen.getByText("火")).not.toHaveClass("bg-red-500");
  });

  it("曜日ボタンをトグルして保存すると選択状態がupdateに渡される", () => {
    const update = jest.fn();
    mockedUseAdminRegularHolidays.mockReturnValue({
      regularHolidays: [{ day_of_week: 1 }],
      isLoading: false,
      update,
      saving: false,
      saveError: null,
      saveSuccess: false,
    });
    render(<RegularHolidayPanel />);

    fireEvent.click(screen.getByText("月")); // 選択解除
    fireEvent.click(screen.getByText("水")); // 追加選択
    fireEvent.click(screen.getByText("保存する"));

    expect(update).toHaveBeenCalledWith([3]);
  });
});
