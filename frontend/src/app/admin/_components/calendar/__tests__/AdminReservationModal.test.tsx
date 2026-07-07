import { render, screen, fireEvent } from "@testing-library/react";
import { AdminReservationModal } from "../AdminReservationModal";
import type { AdminReservation } from "../../../_hooks/useAdminReservations";

const reservation: AdminReservation = {
  id: 1,
  date: "2026-07-08",
  start_time: "10:00",
  end_time: "12:00",
  booker_name: "山田太郎",
  price: 8000,
  user_id: null,
};

describe("AdminReservationModal", () => {
  it("予約詳細を表示する", () => {
    render(
      <AdminReservationModal
        reservation={reservation}
        onCancel={() => {}}
        onClose={() => {}}
        cancelling={false}
        error={null}
      />,
    );

    expect(screen.getByText("山田太郎")).toBeInTheDocument();
    expect(screen.getByText("2026年7月8日（水）")).toBeInTheDocument();
    expect(screen.getByText("10:00 〜 12:00")).toBeInTheDocument();
    expect(screen.getByText("¥8,000")).toBeInTheDocument();
  });

  it("キャンセルするボタンでonCancelが呼ばれる", () => {
    const onCancel = jest.fn();
    render(
      <AdminReservationModal
        reservation={reservation}
        onCancel={onCancel}
        onClose={() => {}}
        cancelling={false}
        error={null}
      />,
    );

    fireEvent.click(screen.getByText("キャンセルする"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("エラーがある場合は表示する", () => {
    render(
      <AdminReservationModal
        reservation={reservation}
        onCancel={() => {}}
        onClose={() => {}}
        cancelling={false}
        error="キャンセルに失敗しました。"
      />,
    );

    expect(screen.getByText("キャンセルに失敗しました。")).toBeInTheDocument();
  });

  it("キャンセル処理中は両方のボタンが無効化される", () => {
    render(
      <AdminReservationModal
        reservation={reservation}
        onCancel={() => {}}
        onClose={() => {}}
        cancelling={true}
        error={null}
      />,
    );

    expect(screen.getByText("閉じる")).toBeDisabled();
    expect(screen.getByText("キャンセル中...")).toBeDisabled();
  });
});
