import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ShiftTable from "../ShiftTable";
import * as shiftService from "../../services/shiftService";

jest.mock("../../services/shiftService");

describe("ShiftTable Component", () => {
  beforeEach(() => {
    shiftService.getAllShifts.mockResolvedValue([
      {
        _id: "1",
        name: "Ca sáng",
        dayOfWeek: 2,
        startTime: "07:00",
        endTime: "09:00",
        className: "CNTT22A",
      },
    ]);
  });

  it("renders shift list", async () => {
    render(<ShiftTable />);

    await waitFor(() => {
      expect(screen.getByText("Ca sáng")).toBeInTheDocument();
      expect(screen.getByText("CNTT22A")).toBeInTheDocument();
    });
  });

  it("opens add shift modal", async () => {
    render(<ShiftTable />);

    fireEvent.click(screen.getByText("+ Thêm ca học"));

    expect(screen.getByText("Thêm ca học")).toBeInTheDocument();
  });

  it("delete shift", async () => {
    shiftService.deleteShift.mockResolvedValue();

    render(<ShiftTable />);

    await waitFor(() => screen.getByText("Xóa"));
    fireEvent.click(screen.getByText("Xóa"));

    expect(shiftService.deleteShift).toHaveBeenCalled();
  });
});
