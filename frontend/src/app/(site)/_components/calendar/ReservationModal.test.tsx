import { render, screen, fireEvent } from "@testing-library/react";
import { ReservationModal } from "./ReservationModal";

const details = {
  dateLabel: "2026年7月8日(水)",
  startTime: "10:00",
  endTime: "12:00",
  duration: 2,
  total: 8000,
};

describe("ReservationModal", () => {
  it("予約内容を表示する", () => {
    render(
      <ReservationModal
        details={details}
        isLoggedIn={true}
        submitting={false}
        error={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("2026年7月8日(水)")).toBeInTheDocument();
    expect(screen.getByText("10:00 〜 12:00")).toBeInTheDocument();
    expect(screen.getByText("2時間")).toBeInTheDocument();
    expect(screen.getByText("¥8,000")).toBeInTheDocument();
  });

  it("未ログインの場合は案内文とログイン誘導ボタンを表示する", () => {
    render(
      <ReservationModal
        details={details}
        isLoggedIn={false}
        submitting={false}
        error={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("予約にはログインが必要です")).toBeInTheDocument();
    expect(screen.getByText("ログインして予約")).toBeInTheDocument();
  });

  it("エラーがある場合は表示する", () => {
    render(
      <ReservationModal
        details={details}
        isLoggedIn={true}
        submitting={false}
        error="その時間は既に予約されています"
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("その時間は既に予約されています")).toBeInTheDocument();
  });

  it("送信中はボタンが無効化され「処理中...」と表示される", () => {
    render(
      <ReservationModal
        details={details}
        isLoggedIn={true}
        submitting={true}
        error={null}
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("処理中...")).toBeDisabled();
  });

  it("予約するボタンでonSubmitが呼ばれる", () => {
    const onSubmit = jest.fn();
    render(
      <ReservationModal
        details={details}
        isLoggedIn={true}
        submitting={false}
        error={null}
        onSubmit={onSubmit}
        onClose={() => {}}
      />,
    );

    fireEvent.click(screen.getByText("予約する"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("キャンセルボタンでonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    render(
      <ReservationModal
        details={details}
        isLoggedIn={true}
        submitting={false}
        error={null}
        onSubmit={() => {}}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByText("キャンセル"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
