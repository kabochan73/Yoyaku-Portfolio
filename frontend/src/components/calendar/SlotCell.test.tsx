import { render, screen, fireEvent } from "@testing-library/react";
import { SlotCell } from "./SlotCell";

describe("SlotCell", () => {
  it("closedの場合は「－」を表示する", () => {
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell status="closed" isStart={false} canBeEnd={false} onClick={() => {}} />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("－", { selector: "span.hidden" })).toBeInTheDocument();
  });

  it("bookedの場合は「予約済」を表示する", () => {
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell status="booked" isStart={false} canBeEnd={false} onClick={() => {}} />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("予約済")).toBeInTheDocument();
  });

  it("bookedLabelが渡された場合はそちらを表示する(admin: 予約者名など)", () => {
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell
              status="booked"
              isStart={false}
              canBeEnd={false}
              onClick={() => {}}
              bookedLabel="山田太郎"
            />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("山田太郎")).toBeInTheDocument();
  });

  it("isStartの場合は「開始」を表示する", () => {
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell status="available" isStart={true} canBeEnd={false} onClick={() => {}} />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("開始")).toBeInTheDocument();
  });

  it("canBeEnd/どちらでもない空きは「空き」を表示する", () => {
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell status="available" isStart={false} canBeEnd={true} onClick={() => {}} />
          </tr>
        </tbody>
      </table>,
    );
    expect(screen.getByText("空き")).toBeInTheDocument();
  });

  it("クリックするとonClickが呼ばれる", () => {
    const onClick = jest.fn();
    render(
      <table>
        <tbody>
          <tr>
            <SlotCell status="available" isStart={false} canBeEnd={false} onClick={onClick} />
          </tr>
        </tbody>
      </table>,
    );
    fireEvent.click(screen.getByText("空き"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
