import { getMonday, addDays, addMonths, toYMD, toYM } from "./date";

describe("getMonday", () => {
  it("水曜日から月曜日を求められる", () => {
    const wednesday = new Date(2026, 6, 8); // 2026-07-08
    expect(toYMD(getMonday(wednesday))).toBe("2026-07-06");
  });

  it("日曜日は前の週の月曜日になる", () => {
    const sunday = new Date(2026, 6, 12); // 2026-07-12
    expect(toYMD(getMonday(sunday))).toBe("2026-07-06");
  });

  it("月曜日自身はそのまま返る", () => {
    const monday = new Date(2026, 6, 6); // 2026-07-06
    expect(toYMD(getMonday(monday))).toBe("2026-07-06");
  });
});

describe("addDays", () => {
  it("日数を加算できる", () => {
    const date = new Date(2026, 6, 6);
    expect(toYMD(addDays(date, 7))).toBe("2026-07-13");
  });

  it("負の値で過去に戻れる", () => {
    const date = new Date(2026, 6, 6);
    expect(toYMD(addDays(date, -1))).toBe("2026-07-05");
  });

  it("月をまたぐ加算もできる", () => {
    const date = new Date(2026, 6, 30);
    expect(toYMD(addDays(date, 3))).toBe("2026-08-02");
  });
});

describe("addMonths", () => {
  it("月を加算できる", () => {
    const date = new Date(2026, 6, 6);
    expect(toYMD(addMonths(date, 1))).toBe("2026-08-06");
  });

  it("年をまたぐ加算もできる", () => {
    const date = new Date(2026, 11, 6);
    expect(toYMD(addMonths(date, 1))).toBe("2027-01-06");
  });
});

describe("toYMD", () => {
  it("YYYY-MM-DD形式に変換できる", () => {
    expect(toYMD(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("toYM", () => {
  it("YYYY-MM形式に変換できる", () => {
    expect(toYM(new Date(2026, 6, 8))).toBe("2026-07");
  });
});
