import { render, screen, fireEvent } from "@testing-library/react";
import { PricePanel } from "../PricePanel";
import { useAdminPrices } from "../../_hooks/useAdminPrices";

jest.mock("../../_hooks/useAdminPrices", () => ({
  useAdminPrices: jest.fn(),
}));

const mockedUseAdminPrices = useAdminPrices as jest.Mock;

describe("PricePanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("現在の料金を初期値として表示する", () => {
    mockedUseAdminPrices.mockReturnValue({
      prices: [
        { type: "weekday", amount_per_hour: 4000 },
        { type: "weekend", amount_per_hour: 5000 },
      ],
      isLoading: false,
      update: jest.fn(),
      saving: false,
      saveError: null,
      saveSuccess: false,
    });
    render(<PricePanel />);
    expect(screen.getByDisplayValue("4000")).toBeInTheDocument();
    expect(screen.getByDisplayValue("5000")).toBeInTheDocument();
  });

  it("フォーム送信で入力値がupdateに渡される", () => {
    const update = jest.fn();
    mockedUseAdminPrices.mockReturnValue({
      prices: [
        { type: "weekday", amount_per_hour: 4000 },
        { type: "weekend", amount_per_hour: 5000 },
      ],
      isLoading: false,
      update,
      saving: false,
      saveError: null,
      saveSuccess: false,
    });
    render(<PricePanel />);

    fireEvent.change(screen.getByDisplayValue("4000"), { target: { value: "4500" } });
    fireEvent.click(screen.getByText("保存する"));

    expect(update).toHaveBeenCalledWith(4500, 5000);
  });

  it("保存エラー・保存成功メッセージを表示する", () => {
    mockedUseAdminPrices.mockReturnValue({
      prices: [],
      isLoading: false,
      update: jest.fn(),
      saving: false,
      saveError: "保存に失敗しました。",
      saveSuccess: false,
    });
    render(<PricePanel />);
    expect(screen.getByText("保存に失敗しました。")).toBeInTheDocument();
  });
});
