import { render, screen, fireEvent } from "@testing-library/react";
import { WeekNavigator } from "./WeekNavigator";

describe("WeekNavigator", () => {
  it("見出しに週ラベルを表示する", () => {
    render(
      <WeekNavigator
        weekLabel="2026/07/06 〜 2026/07/12"
        canGoPrev={true}
        canGoNext={true}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText("2026/07/06 〜 2026/07/12")).toBeInTheDocument();
  });

  it("canGoPrev=trueなら「前の週」クリックでonPrevが呼ばれる", () => {
    const onPrev = jest.fn();
    render(
      <WeekNavigator
        weekLabel=""
        canGoPrev={true}
        canGoNext={true}
        onPrev={onPrev}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("← 前の週"));
    expect(onPrev).toHaveBeenCalledTimes(1);
  });

  it("canGoPrev=falseなら「前の週」クリックしてもonPrevは呼ばれない", () => {
    const onPrev = jest.fn();
    render(
      <WeekNavigator
        weekLabel=""
        canGoPrev={false}
        canGoNext={true}
        onPrev={onPrev}
        onNext={() => {}}
      />,
    );
    fireEvent.click(screen.getByText("← 前の週"));
    expect(onPrev).not.toHaveBeenCalled();
  });

  it("canGoNext=falseなら「次の週」クリックしてもonNextは呼ばれない", () => {
    const onNext = jest.fn();
    render(
      <WeekNavigator
        weekLabel=""
        canGoPrev={true}
        canGoNext={false}
        onPrev={() => {}}
        onNext={onNext}
      />,
    );
    fireEvent.click(screen.getByText("次の週 →"));
    expect(onNext).not.toHaveBeenCalled();
  });

  it("無効なボタンはaria-disabledがtrueになる", () => {
    render(
      <WeekNavigator
        weekLabel=""
        canGoPrev={false}
        canGoNext={true}
        onPrev={() => {}}
        onNext={() => {}}
      />,
    );
    expect(screen.getByText("← 前の週")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByText("次の週 →")).toHaveAttribute("aria-disabled", "false");
  });
});
