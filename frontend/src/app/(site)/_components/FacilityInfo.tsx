type Price = {
  type: "weekday" | "weekend";
  amount_per_hour: number;
};

type RegularHoliday = {
  day_of_week: number;
};

const DAY_NAMES = ["日", "月", "火", "水", "木", "金", "土"];

const FALLBACK_PRICES: Price[] = [
  { type: "weekday", amount_per_hour: 4000 },
  { type: "weekend", amount_per_hour: 5000 },
];

async function getPrices(): Promise<Price[]> {
  if (!process.env.API_URL) return FALLBACK_PRICES;
  try {
    const res = await fetch(`${process.env.API_URL}/prices`, {
      next: { tags: ["prices"] },
    });
    if (!res.ok) throw new Error("failed to fetch prices");
    return res.json();
  } catch {
    return FALLBACK_PRICES;
  }
}

async function getRegularHolidays(): Promise<RegularHoliday[]> {
  if (!process.env.API_URL) return [];
  try {
    const res = await fetch(`${process.env.API_URL}/regular-holidays`, {
      next: { tags: ["regular-holidays"] },
    });
    if (!res.ok) throw new Error("failed to fetch regular holidays");
    return res.json();
  } catch {
    return [];
  }
}

export async function FacilityInfo() {
  const [prices, holidays] = await Promise.all([
    getPrices(),
    getRegularHolidays(),
  ]);

  const weekday = prices.find((p) => p.type === "weekday");
  const weekend = prices.find((p) => p.type === "weekend");
  const holidayNames = holidays
    .map((h) => `${DAY_NAMES[h.day_of_week]}曜日`)
    .join("・");

  const items = [
    { label: "営業時間", value: "10:00〜22:00" },
    {
      label: "料金",
      value: `平日 ${weekday?.amount_per_hour.toLocaleString()}円/h・土日 ${weekend?.amount_per_hour.toLocaleString()}円/h`,
    },
    { label: "定休日", value: holidayNames || "なし" },
    { label: "利用時間", value: "最低2時間〜最大4時間" },
    { label: "レンタル", value: "ボール・ビブス無料" },
    { label: "支払い方法", value: "現地払いのみ" },
  ];

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <ul className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2">
            <span className="mt-1 text-green-600">●</span>
            <div>
              <p className="text-sm text-zinc-500">{item.label}</p>
              <p className="font-semibold text-zinc-900">{item.value}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
