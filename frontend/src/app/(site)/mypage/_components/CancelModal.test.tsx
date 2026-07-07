import { render, screen, fireEvent } from "@testing-library/react";
import { CancelModal } from "./CancelModal";

const details = {
  dateLabel: "2026年7月8日(水)",
  startTime: "10:00",
  endTime: "12:00",
  duration: 2,
  total: 8000,
};

describe("CancelModal", () => {
  it("予約内容を表示する", () => {
    render(<CancelModal details={details} onConfirm={() => {}} onClose={() => {}} loading={false} />);

    expect(screen.getByText("2026年7月8日(水)")).toBeInTheDocument();
    expect(screen.getByText("10:00 〜 12:00")).toBeInTheDocument();
    expect(screen.getByText("2時間")).toBeInTheDocument();
    expect(screen.getByText("¥8,000")).toBeInTheDocument();
  });

  it("キャンセルするボタンでonConfirmが呼ばれる", () => {
    const onConfirm = jest.fn();
    render(<CancelModal details={details} onConfirm={onConfirm} onClose={() => {}} loading={false} />);

    fireEvent.click(screen.getByText("キャンセルする"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("戻るボタンでonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    render(<CancelModal details={details} onConfirm={() => {}} onClose={onClose} loading={false} />);

    fireEvent.click(screen.getByText("戻る"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("処理中は両方のボタンが無効化される", () => {
    render(<CancelModal details={details} onConfirm={() => {}} onClose={() => {}} loading={true} />);

    expect(screen.getByText("戻る")).toBeDisabled();
    expect(screen.getByText("キャンセル中...")).toBeDisabled();
  });
});
