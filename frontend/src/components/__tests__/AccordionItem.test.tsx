import { render, screen, fireEvent } from "@testing-library/react";
import { AccordionItem } from "../AccordionItem";

describe("AccordionItem", () => {
  it("初期状態では子要素はマウントされない", () => {
    render(
      <AccordionItem title="設定">
        <p>中身のコンテンツ</p>
      </AccordionItem>,
    );

    expect(screen.getByText("設定")).toBeInTheDocument();
    expect(screen.queryByText("中身のコンテンツ")).not.toBeInTheDocument();
  });

  it("開くと子要素がマウントされる", () => {
    const { container } = render(
      <AccordionItem title="設定">
        <p>中身のコンテンツ</p>
      </AccordionItem>,
    );

    // jsdomはクリックでdetailsのopen属性は切り替えるが、toggleイベントは発火しないため手動で発行する
    fireEvent.click(screen.getByText("設定"));
    fireEvent(container.querySelector("details")!, new Event("toggle"));

    expect(screen.getByText("中身のコンテンツ")).toBeInTheDocument();
  });
});
