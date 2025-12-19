// utils/checkShiftConflict.js

module.exports = (existing, newItem) => {
  return existing.some(
    (item) =>
      item.shiftId.dayOfWeek === newItem.shiftId.dayOfWeek &&
      !(newItem.weekEnd < item.weekStart || newItem.weekStart > item.weekEnd) &&
      item.shiftId.startTime < newItem.shiftId.endTime &&
      newItem.shiftId.startTime < item.shiftId.endTime
  );
};
