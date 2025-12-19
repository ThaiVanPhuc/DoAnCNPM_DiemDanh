import { vi } from "vitest";

export const getAllShifts = vi.fn(() =>
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
);

export const createShift = vi.fn(() => Promise.resolve());
export const updateShift = vi.fn(() => Promise.resolve());
export const deleteShift = vi.fn(() => Promise.resolve());
