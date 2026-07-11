import type { SlotStatus } from "@/types/calendar";

type Props = {
  status: SlotStatus;
  isStart: boolean;
  canBeEnd: boolean;
  onClick: () => void;
  /** 予約済みマスをクリック可能にするか（admin: 詳細確認のため true、site: false） */
  bookedClickable?: boolean;
  /** 予約済みマスのラベル（admin: 予約者名など。省略時は「予約済」） */
  bookedLabel?: string;
};

export function SlotCell({
  status,
  isStart,
  canBeEnd,
  onClick,
  bookedClickable = false,
  bookedLabel,
}: Props) {
  let cellCls = "";
  let mobileLabel = "";
  let label = "";

  if (status === "closed") {
    cellCls = "bg-zinc-100 text-zinc-400 cursor-default";
    mobileLabel = "－";
    label = "－";
  } else if (status === "booked") {
    cellCls = bookedClickable
      ? "bg-red-50 text-red-400 cursor-pointer hover:bg-red-100 "
      : "bg-red-50 text-red-400 cursor-default";
    mobileLabel = "✕";
    label = bookedLabel ?? "予約済";
  } else if (isStart) {
    cellCls = "bg-green-600 text-white cursor-pointer";
    mobileLabel = "空";
    label = "開始";
  } else if (canBeEnd) {
    cellCls = "bg-green-100 text-green-700 ring-1 ring-green-400 cursor-pointer";
    mobileLabel = "空";
    label = "空き";
  } else {
    cellCls = "bg-white text-green-700 hover:bg-green-50 cursor-pointer";
    mobileLabel = "空";
    label = "空き";
  }

  return (
    <td className="py-1.5 px-1.5 text-center" onClick={onClick}>
      <span
        className={`inline-block max-w-full truncate rounded-md px-1 py-1 align-bottom text-xs font-semibold transition sm:px-4 ${cellCls}`}
      >
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </td>
  );
}
