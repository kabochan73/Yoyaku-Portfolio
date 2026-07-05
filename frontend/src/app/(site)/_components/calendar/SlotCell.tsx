type SlotStatus = "available" | "booked" | "closed";

type Props = {
  status: SlotStatus;
  isStart: boolean;
  canBeEnd: boolean;
  onClick: () => void;
};

export function SlotCell({ status, isStart, canBeEnd, onClick }: Props) {
  let cellCls = "";
  let mobileLabel = "";
  let label = "";

  if (status === "closed") {
    cellCls = "bg-zinc-100 text-zinc-400 cursor-default";
    mobileLabel = "－";
    label = "－";
  } else if (status === "booked") {
    cellCls = "bg-red-50 text-red-400 cursor-default";
    mobileLabel = "✕";
    label = "予約済み";
  } else if (isStart) {
    cellCls = "bg-green-600 text-white cursor-pointer";
    mobileLabel = "●";
    label = "開始";
  } else if (canBeEnd) {
    cellCls = "bg-green-100 text-green-700 ring-1 ring-green-400 cursor-pointer";
    mobileLabel = "○";
    label = "空き";
  } else {
    cellCls = "bg-white text-green-700 hover:bg-green-50 cursor-pointer";
    mobileLabel = "○";
    label = "空き";
  }

  return (
    <td className="py-1.5 text-center" onClick={onClick}>
      <span
        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold transition sm:px-4 ${cellCls}`}
      >
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </td>
  );
}
