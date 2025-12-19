import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ShiftTable from "../ShiftTable";
import { vi } from "vitest";

// ⚡ Mock toàn bộ shiftService, không import api.js thật
vi.mock("../../services/shiftService", () => ({
  getAllShifts: vi.fn(() =>
    Promise.resolve([
      {
        _id: "1",
        name: "Ca sáng",
        dayOfWeek: 2,
        startTime: "07:00",
        endTime: "09:00",
        className: "CNTT22A",
      },
    ])
  ),
  createShift: vi.fn(),
  updateShift: vi.fn(),
  deleteShift: vi.fn(() => Promise.resolve()),
}));

describe("ShiftTable Component", () => {
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

});
