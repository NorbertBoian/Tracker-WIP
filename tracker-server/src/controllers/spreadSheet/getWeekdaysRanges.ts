import { getElementRanges } from "./getElementRanges";
import {
  weekdaysColumnsPixelRangesType,
  weekdaysRowsPixelRangesType,
} from "./getWeekdaysSettingsPoints";

const weekdayRowsHeightsKeys = [
  "topPadding",
  "content",
  "bottomPadding",
] as const;

const fullWidth = "fullWidth" as const;
const leftPadding = "leftPadding" as const;
const weekdayColumn = "weekdayColumn" as const;
const firstGap = "firstGap" as const;
const requiredHoursColumn = "requiredHoursColumn" as const;
const secondGap = "secondGap" as const;
const disabledDayColumn = "disabledDayColumn" as const;
const thirdGap = "thirdGap" as const;
const colorColumn = "colorColumn" as const;
const rightPadding = "rightPadding" as const;

const topPadding = "topPadding" as const;
const bottomPadding = "bottomPadding" as const;

const weekdayMergesWidths = {
  topPadding: fullWidth,
  content: {
    leftPadding,
    weekdayColumn,
    firstGap,
    requiredHoursColumn,
    secondGap,
    disabledDayColumn,
    thirdGap,
    colorColumn,
    rightPadding,
  } as const,
  bottomPadding: fullWidth,
} as const;

export const getWeekdaysRanges = (
  sortedUniqueColumnPoints: number[],
  sortedUniqueRowPoints: number[],
  weekdaysRowsPixelRanges: weekdaysRowsPixelRangesType,
  weekdaysColumnsPixelRanges: weekdaysColumnsPixelRangesType,
) => {
  const weekdaysRanges = Array.from({ length: 7 }, (v, index) => {
    const weekdayRanges = getElementRanges(
      weekdaysColumnsPixelRanges,
      weekdaysRowsPixelRanges[index],
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      weekdayRowsHeightsKeys,
      weekdayMergesWidths,
      leftPadding,
      rightPadding,
      topPadding,
      bottomPadding,
    );
    return weekdayRanges;
  });

  return weekdaysRanges;
};
