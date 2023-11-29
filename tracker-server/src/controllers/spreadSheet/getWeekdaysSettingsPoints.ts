import { getElementRanges } from "./getElementRanges";
import { getWeekdaysRanges as nestedGetWeekdaysRanges } from "./getWeekdaysRanges";

const weekdayColumnsWidthsKeys = [
  "leftPadding",
  "weekdayColumn",
  "firstGap",
  "requiredHoursColumn",
  "secondGap",
  "disabledDayColumn",
  "thirdGap",
  "colorColumn",
  "rightPadding",
] as const;

const weekdayRowsHeightsKeys = [
  "topPadding",
  "content",
  "bottomPadding",
] as const;

const weekdayColumn = "weekdayColumn" as const;
const firstGap = "firstGap" as const;
const requiredHoursColumn = "requiredHoursColumn" as const;
const secondGap = "secondGap" as const;
const disabledDayColumn = "disabledDayColumn" as const;
const thirdGap = "thirdGap" as const;
const colorColumn = "colorColumn" as const;
const leftPadding = "leftPadding" as const;
const rightPadding = "rightPadding" as const;

export type weekdaysColumnsPixelRangesType = {
  [key in typeof weekdayColumnsWidthsKeys[number]]: [number, number];
};

export type weekdaysRowsPixelRangesType = {
  [key in typeof weekdayRowsHeightsKeys[number]]: [number, number];
}[];

export const getWeekdaysSettingsPoints = (
  weekday: {
    width: number;
    height: number;
    padding: number;
    gap: number;
    weekdayColumnWidthAddend: number;
    requiredHoursColumnWidthAddend: number;
    disabledDayColumnWidthAddend: number;
    colorColumnWidthAddend: number;
  },
  weekdaysContainer: {
    gap: number;
    blockMargin: number;
  },
  weekdaysColumnsNamesHeight: number,
  viewportWidth: number,
  topOffset: number,
) => {
  const weekdaysContainerInlineMarginSum = viewportWidth - weekday.width;

  const weekdaysContainerLeftMarginWidth = Math.floor(
    weekdaysContainerInlineMarginSum / 2,
  );

  const weekdayColumnsWidthsAddendsSum =
    weekday.weekdayColumnWidthAddend +
    weekday.requiredHoursColumnWidthAddend +
    weekday.disabledDayColumnWidthAddend +
    weekday.colorColumnWidthAddend;

  const weekdayColumnWidthRatio =
    weekday.weekdayColumnWidthAddend / weekdayColumnsWidthsAddendsSum;
  const requiredHoursColumnWidthRatio =
    weekday.requiredHoursColumnWidthAddend / weekdayColumnsWidthsAddendsSum;
  const disabledDayColumnWidthRatio =
    weekday.disabledDayColumnWidthAddend / weekdayColumnsWidthsAddendsSum;
  const colorColumnWidthRatio =
    weekday.colorColumnWidthAddend / weekdayColumnsWidthsAddendsSum;

  const weekdayWidthNoWhitespace =
    weekday.width - weekday.padding * 2 - weekday.gap * 3;

  const weekdayColumnWidth = Math.floor(
    weekdayColumnWidthRatio * weekdayWidthNoWhitespace,
  );
  const requiredHoursColumnWidth = Math.floor(
    requiredHoursColumnWidthRatio * weekdayWidthNoWhitespace,
  );
  const disabledDayColumnWidth = Math.floor(
    disabledDayColumnWidthRatio * weekdayWidthNoWhitespace,
  );
  const colorColumnWidth = Math.floor(
    colorColumnWidthRatio * weekdayWidthNoWhitespace,
  );

  const diferrence =
    weekdayColumnWidth +
    requiredHoursColumnWidth +
    disabledDayColumnWidth +
    colorColumnWidth -
    weekdayWidthNoWhitespace;

  const adjustedDisabledDayColumnWidth = disabledDayColumnWidth + diferrence;

  const weekdayColumnsWidths = {
    leftPadding: weekday.padding,
    weekdayColumn: weekdayColumnWidth,
    firstGap: weekday.gap,
    requiredHoursColumn: requiredHoursColumnWidth,
    secondGap: weekday.gap,
    disabledDayColumn: adjustedDisabledDayColumnWidth,
    thirdGap: weekday.gap,
    colorColumn: colorColumnWidth,
    rightPadding: weekday.padding,
  };

  const contentHeight = weekday.height - weekday.padding * 2;

  const weekdayRowsHeights = {
    topPadding: weekday.padding,
    content: contentHeight,
    bottomPadding: weekday.padding,
  };

  const columnPoints = [weekdaysContainerLeftMarginWidth, viewportWidth];

  let leftOffset = weekdaysContainerLeftMarginWidth;

  const weekdayContainerBlockGapsPixelRanges: [number, number][] = [];

  const weekdaysColumnsPixelRanges: {
    [key in typeof weekdayColumnsWidthsKeys[number]]: [number, number];
  } = {} as any;

  for (const weekdayColumn of weekdayColumnsWidthsKeys) {
    const columnWidth = weekdayColumnsWidths[weekdayColumn];
    const nextColumnLeftOffset = leftOffset + columnWidth;
    weekdaysColumnsPixelRanges[weekdayColumn] = [
      leftOffset,
      nextColumnLeftOffset,
    ];
    columnPoints.push(nextColumnLeftOffset);
    leftOffset = nextColumnLeftOffset;
  }

  const rowPoints = [topOffset];

  const weekdaysRowsPixelRanges: weekdaysRowsPixelRangesType = [];

  const weekdayContainerVerticalGapsPixelRanges: [number, number][] = [];

  const nextRowTopOffset = topOffset + weekdaysColumnsNamesHeight;
  const weekdayColumnsNamesRowPixelRange = {
    content: [topOffset, nextRowTopOffset] as [number, number],
  };
  rowPoints.push(nextRowTopOffset);
  topOffset = nextRowTopOffset;

  rowPoints.push(topOffset + weekdaysContainer.blockMargin);
  topOffset += weekdaysContainer.blockMargin;

  Array.from({ length: 7 }).forEach((unused, index) => {
    const weekdayRowPixelRanges: {
      [key in typeof weekdayRowsHeightsKeys[number]]: [number, number];
    } = {} as any;

    for (const weekdayRow of weekdayRowsHeightsKeys) {
      const rowHeight = weekdayRowsHeights[weekdayRow];
      const nextRowTopOffset = topOffset + rowHeight;
      weekdayRowPixelRanges[weekdayRow] = [topOffset, nextRowTopOffset];
      rowPoints.push(nextRowTopOffset);
      topOffset = nextRowTopOffset;
    }
    weekdaysRowsPixelRanges.push(weekdayRowPixelRanges);
    const nextRowTopOffset = topOffset + weekdaysContainer.gap;
    if (index < 6) {
      weekdayContainerVerticalGapsPixelRanges.push([
        topOffset,
        nextRowTopOffset,
      ]);
      rowPoints.push(nextRowTopOffset);
      topOffset = nextRowTopOffset;
    }
  });

  topOffset += weekdaysContainer.blockMargin;
  rowPoints.push(topOffset);

  const weekdayColumnsNamesMergesWidths = {
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
  } as const;

  const getWeekdaysColumnsNamesRanges = (
    sortedUniqueColumnPoints: number[],
    sortedUniqueRowPoints: number[],
  ) =>
    getElementRanges(
      weekdaysColumnsPixelRanges,
      weekdayColumnsNamesRowPixelRange,
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      ["content"],
      weekdayColumnsNamesMergesWidths,
      leftPadding,
      rightPadding,
      "content",
      "content",
    );

  const getWeekdaysRanges = (
    sortedUniqueColumnPoints: number[],
    sortedUniqueRowPoints: number[],
  ) =>
    nestedGetWeekdaysRanges(
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      weekdaysRowsPixelRanges,
      weekdaysColumnsPixelRanges,
    );

  return {
    weekdaysRowsPoints: rowPoints,
    weekdaysColumnsPoints: columnPoints,
    getWeekdaysRanges,
    getWeekdaysColumnsNamesRanges,
    topOffset,
  };
};
