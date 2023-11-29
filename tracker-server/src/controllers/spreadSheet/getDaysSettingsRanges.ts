import { getElementRanges } from "./getElementRanges";
import { getWidthsFromRatio } from "./getWidthsFromRatio";

const dayColumnsWidthsKeys = [
  "leftPadding",
  "names",
  "gap",
  "values",
  "rightPadding",
] as const;

const dayRowsHeightsKeys = [
  "topPadding",
  "weekdayRow",
  "dateRow",
  "hourlyRateRow",
  "firstGap",
  "overtimeMultiplierRow",
  "secondGap",
  "requiredHoursRow",
  "thirdGap",
  "isHolidayRow",
  "bottomPadding",
] as const;

export type daysColumnsPixelRangesType = {
  [key in typeof dayColumnsWidthsKeys[number]]: [number, number];
}[];

const fullWidth = "fullWidth" as const;
const names = "names" as const;
const values = "values" as const;
const leftPadding = "leftPadding" as const;
const rightPadding = "rightPadding" as const;
const topPadding = "topPadding" as const;
const bottomPadding = "bottomPadding" as const;

const dayMergesWidths = {
  topPadding: fullWidth,
  weekdayRow: fullWidth,
  dateRow: fullWidth,
  hourlyRateRow: { leftPadding, names, values, rightPadding } as const,
  firstGap: fullWidth,
  overtimeMultiplierRow: { leftPadding, names, values, rightPadding } as const,
  secondGap: fullWidth,
  requiredHoursRow: { leftPadding, names, values, rightPadding } as const,
  thirdGap: fullWidth,
  isHolidayRow: { leftPadding, names, values, rightPadding } as const,
  bottomPadding: fullWidth,
} as const;

export type daysRowsPixelRangesType = {
  [key in typeof dayRowsHeightsKeys[number]]: [number, number];
}[];

export const getDaysSettingsRanges = (
  day: {
    width: number;
    height: number;
    padding: number;
    gridColumns: number;
    weekdayRowHeight: number;
    dateRowHeight: number;
    gap: number;
  },
  {
    daysContainerLeftMargin,
    daysContainerRightMargin,
    daysPerRow,
    dayContainerInlineGapWidth,
    dayContainerRows,
    daysInLastRow,
  }: {
    daysContainerLeftMargin: number;
    daysContainerRightMargin: number;
    daysPerRow: number;
    dayContainerInlineGapWidth: number;
    dayContainerRows: number;
    daysInLastRow: number;
  },
  viewportWidth: number,
  daysContainer: {
    topMargin: number;
    verticalGridGap: number;
    bottomMargin: number;
  },
) => {
  const dayWidthWithoutWhitespace = day.width - day.padding * 2;

  const [namesWidth, valuesWidth] = getWidthsFromRatio(
    day.gridColumns,
    dayWidthWithoutWhitespace,
  );

  const dayColumnsWidths = {
    leftPadding: day.padding,
    names: namesWidth,
    gap: day.gap,
    values: valuesWidth,
    rightPadding: day.padding,
  };

  const fieldsHeightSum =
    day.height -
    day.padding * 2 -
    day.dateRowHeight -
    day.weekdayRowHeight -
    day.gap * 3;
  const fieldHeight = Math.floor(fieldsHeightSum / 4);
  const spareVerticalWhitespace = fieldsHeightSum % 4;

  const dayRowsHeights = {
    topPadding: day.padding + spareVerticalWhitespace,
    weekdayRow: day.weekdayRowHeight,
    dateRow: day.dateRowHeight,
    hourlyRateRow: fieldHeight,
    firstGap: day.gap,
    overtimeMultiplierRow: fieldHeight,
    secondGap: day.gap,
    requiredHoursRow: fieldHeight,
    thirdGap: day.gap,
    isHolidayRow: fieldHeight,
    bottomPadding: day.padding,
  };

  const columnPoints = [
    0,
    daysContainerLeftMargin,
    viewportWidth - daysContainerRightMargin,
    viewportWidth,
  ];
  let leftOffset = daysContainerLeftMargin;

  const daysColumnsPixelRanges: daysColumnsPixelRangesType = [];

  const dayContainerInlineGapsPixelRanges: [number, number][] = [];

  Array.from({ length: daysPerRow }).forEach((unused, index) => {
    const dayColumnsPixelRanges: {
      [key in typeof dayColumnsWidthsKeys[number]]: [number, number];
    } = {} as any;

    for (const dayColumn of dayColumnsWidthsKeys) {
      const columnWidth = dayColumnsWidths[dayColumn];
      const nextColumnLeftOffset = leftOffset + columnWidth;
      dayColumnsPixelRanges[dayColumn] = [leftOffset, nextColumnLeftOffset];
      columnPoints.push(nextColumnLeftOffset);
      leftOffset = nextColumnLeftOffset;
    }
    daysColumnsPixelRanges.push(dayColumnsPixelRanges);
    if (index < daysPerRow - 1) {
      const nextColumnLeftOffset = leftOffset + dayContainerInlineGapWidth;
      dayContainerInlineGapsPixelRanges.push([
        leftOffset,
        nextColumnLeftOffset,
      ]);
      columnPoints.push(nextColumnLeftOffset);
      leftOffset = nextColumnLeftOffset;
    }
  });

  let topOffset = daysContainer.topMargin;

  const rowPoints = [0, topOffset];

  const daysRowsPixelRanges: daysRowsPixelRangesType = [];

  const dayContainerVerticalGapsPixelRanges: [number, number][] = [];

  Array.from({ length: dayContainerRows }).forEach((unused, index) => {
    const dayRowPixelRanges: {
      [key in typeof dayRowsHeightsKeys[number]]: [number, number];
    } = {} as any;

    for (const dayRow of dayRowsHeightsKeys) {
      const rowHeight = dayRowsHeights[dayRow];
      const nextRowTopOffset = topOffset + rowHeight;
      dayRowPixelRanges[dayRow] = [topOffset, nextRowTopOffset];
      rowPoints.push(nextRowTopOffset);
      topOffset = nextRowTopOffset;
    }
    daysRowsPixelRanges.push(dayRowPixelRanges);
    const nextRowTopOffset = topOffset + daysContainer.verticalGridGap;
    if (index < dayContainerRows - 1) {
      dayContainerVerticalGapsPixelRanges.push([topOffset, nextRowTopOffset]);
      rowPoints.push(nextRowTopOffset);
      topOffset = nextRowTopOffset;
    }
  });

  rowPoints.push(topOffset + daysContainer.bottomMargin);

  const daysRanges = [];

  const sortedUniqueColumnPoints = [...new Set(columnPoints)].sort(
    (a, b) => a - b,
  );
  const sortedUniqueRowPoints = [...new Set(rowPoints)].sort((a, b) => a - b);

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

  return { daysRanges, sortedUniqueColumnPoints, sortedUniqueRowPoints };
};
