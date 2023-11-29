import { getDaysRanges as nestedGetDaysRanges } from "./getDaysRanges";

const dayColumnsWidthsKeys = ["leftPadding", "field", "rightPadding"] as const;

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

export type daysColumnsPixelRangesType = {
  [key in typeof dayColumnsWidthsKeys[number]]: [number, number];
}[];

export type daysRowsPixelRangesType = {
  [key in typeof dayRowsHeightsKeys[number]]: [number, number];
}[];

export const getDaysPoints = (
  day: {
    width: number;
    height: number;
    padding: number;
    weekdayRowHeight: number;
    holidayRowHeight: number;
    dateRowHeight: number;
    fieldTopMargin: number;
    fieldHeight: number;
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
    minInlineMargin: number;
    minHorizontalGridGap: number;
    verticalGridGap: number;
  },
  topOffset: number,
) => {
  const dayColumnsWidths = {
    leftPadding: day.padding,
    field: day.width - day.padding * 2,
    rightPadding: day.padding,
  };

  const dayRowsHeights = {
    topPadding: day.padding,
    weekdayRow: day.weekdayRowHeight,
    holidayRow: day.holidayRowHeight,
    dateRow: day.dateRowHeight,
    firstFieldTopMargin: day.fieldTopMargin,
    firstField: day.fieldHeight,
    secondFieldTopMargin: day.fieldTopMargin,
    secondField: day.fieldHeight,
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

  topOffset += daysContainer.topMargin;
  const rowPoints = [topOffset];

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

  const getDaysRanges = (
    sortedUniqueColumnPoints: number[],
    sortedUniqueRowPoints: number[],
  ) =>
    nestedGetDaysRanges(
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      dayContainerRows,
      daysInLastRow,
      daysPerRow,
      daysRowsPixelRanges,
      daysColumnsPixelRanges,
    );

  return {
    daysRowsPoints: rowPoints,
    daysColumnsPoints: columnPoints,
    getDaysRanges,
    topOffset,
  };
};
