import { render, screen, fireEvent } from "@testing-library/react";
import { PhoneReservationModal } from "../PhoneReservationModal";

const details = {
  dateLabel: "2026年7月8日(水)",
  startTime: "10:00",
  endTime: "12:00",
  duration: 2,
  total: 8000,
};

describe("PhoneReservationModal", () => {
  it("予約者名が未入力の間は登録ボタンが無効", () => {
    render(
      <PhoneReservationModal details={details} submitting={false} error={null} onSubmit={() => {}} onClose={() => {}} />,
    );

    expect(screen.getByText("登録する")).toBeDisabled();
  });

  it("予約者名を入力すると登録ボタンが有効になり、入力値でonSubmitが呼ばれる", () => {
    const onSubmit = jest.fn();
    render(
      <PhoneReservationModal details={details} submitting={false} error={null} onSubmit={onSubmit} onClose={() => {}} />,
    );

    const bookerNameInput = screen.getByText("予約者名").nextElementSibling as HTMLElement;
    fireEvent.change(bookerNameInput, { target: { value: "田中花子" } });
    const submitButton = screen.getByText("登録する");
    expect(submitButton).toBeEnabled();

    fireEvent.click(submitButton);
    expect(onSubmit).toHaveBeenCalledWith("田中花子");
  });

  it("空白のみの入力では登録ボタンが無効のまま", () => {
    render(
      <PhoneReservationModal details={details} submitting={false} error={null} onSubmit={() => {}} onClose={() => {}} />,
    );

    const bookerNameInput = screen.getByText("予約者名").nextElementSibling as HTMLElement;
    fireEvent.change(bookerNameInput, { target: { value: "   " } });
    expect(screen.getByText("登録する")).toBeDisabled();
  });

  it("エラーがある場合は表示する", () => {
    render(
      <PhoneReservationModal
        details={details}
        submitting={false}
        error="その時間は既に予約されています"
        onSubmit={() => {}}
        onClose={() => {}}
      />,
    );

    expect(screen.getByText("その時間は既に予約されています")).toBeInTheDocument();
  });

  it("送信中は「登録中...」と表示されボタンが無効になる", () => {
    render(
      <PhoneReservationModal details={details} submitting={true} error={null} onSubmit={() => {}} onClose={() => {}} />,
    );

    expect(screen.getByText("登録中...")).toBeDisabled();
  });

  it("キャンセルボタンでonCloseが呼ばれる", () => {
    const onClose = jest.fn();
    render(
      <PhoneReservationModal details={details} submitting={false} error={null} onSubmit={() => {}} onClose={onClose} />,
    );

    fireEvent.click(screen.getByText("キャンセル"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
