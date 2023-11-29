import {
  daysColumnsPixelRangesType,
  daysRowsPixelRangesType,
} from "./getDaysPoints";
import { getElementRanges } from "./getElementRanges";

const dayRowsHeightsKeys = [
  "topPadding",
  "weekdayRow",
  "holidayRow",
  "dateRow",
  "firstFieldTopMargin",
  "firstField",
  "secondFieldTopMargin",
  "secondField",
  "bottomPadding",
] as const;

const fullWidth = "fullWidth" as const;
const field = "field" as const;
const leftPadding = "leftPadding" as const;
const rightPadding = "rightPadding" as const;
const topPadding = "topPadding" as const;
const bottomPadding = "bottomPadding" as const;

const dayMergesWidths = {
  topPadding: fullWidth,
  weekdayRow: fullWidth,
  holidayRow: fullWidth,
  dateRow: fullWidth,
  firstFieldTopMargin: fullWidth,
  firstField: { leftPadding, field, rightPadding } as const,
  secondFieldTopMargin: fullWidth,
  secondField: { leftPadding, field, rightPadding } as const,
  bottomPadding: fullWidth,
} as const;

export const getDaysRanges = (
  sortedUniqueColumnPoints: number[],
  sortedUniqueRowPoints: number[],
  dayContainerRows: number,
  daysInLastRow: number,
  daysPerRow: number,
  daysRowsPixelRanges: daysRowsPixelRangesType,
  daysColumnsPixelRanges: daysColumnsPixelRangesType,
) => {
  const daysRanges = [];

  for (
    let dayContainerRowIndex = 0;
    dayContainerRowIndex < dayContainerRows;
    dayContainerRowIndex++
  ) {
    const daysInRow =
      dayContainerRowIndex === dayContainerRows - 1
        ? daysInLastRow
        : daysPerRow;
    for (
      let dayContainerColumnIndex = 0;
      dayContainerColumnIndex < daysInRow;
      dayContainerColumnIndex++
    ) {
      const dayRanges = getElementRanges(
        daysColumnsPixelRanges[dayContainerColumnIndex],
        daysRowsPixelRanges[dayContainerRowIndex],
        sortedUniqueColumnPoints,
        sortedUniqueRowPoints,
        dayRowsHeightsKeys,
        dayMergesWidths,
        leftPadding,
        rightPadding,
        topPadding,
        bottomPadding,
      );
      daysRanges.push(dayRanges);
    }
  }
  return daysRanges;
};
