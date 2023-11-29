import { getElementRanges } from "./getElementRanges";
import { getWidthsFromRatio } from "./getWidthsFromRatio";

const monthlyStatsColumnsWidthsKeys = [
  "leftPadding",
  "names",
  "gap",
  "values",
  "rightPadding",
] as const;

const monthlyStatsRowsHeightsKeys = [
  "topPadding",
  "firstField",
  "gap",
  "secondField",
  "bottomPadding",
] as const;

const fullWidth = "fullWidth" as const;
const leftPadding = "leftPadding" as const;
const rightPadding = "rightPadding" as const;
const topPadding = "topPadding" as const;
const bottomPadding = "bottomPadding" as const;
const gap = "gap" as const;
const names = "names" as const;
const values = "values" as const;

export const getMonthlyStatsPoints = (
  monthlyStats = {
    width: 390,
    height: 75,
    gridColumns: 1 / 2,
    gap: 10,
    padding: 10,
  },
  topOffset: number,
) => {
  const monthlyStatsWidthWithoutWhitespace =
    monthlyStats.width - monthlyStats.padding * 2 - monthlyStats.gap;

  const [descriptionsWidth, valuesWidth] = getWidthsFromRatio(
    monthlyStats.gridColumns,
    monthlyStatsWidthWithoutWhitespace,
  );

  const monthlyStatsColumnsWidths = {
    leftPadding: monthlyStats.padding,
    names: descriptionsWidth,
    gap: monthlyStats.gap,
    values: valuesWidth,
    rightPadding: monthlyStats.padding,
  };

  const fieldsHeightSum =
    monthlyStats.height - monthlyStats.padding * 2 - monthlyStats.gap;
  const spareVerticalWhitespace = fieldsHeightSum % 2;
  const additionalPadding = Math.floor(spareVerticalWhitespace / 2);
  const additionalGap = spareVerticalWhitespace % 2;
  const fieldHeight = Math.floor(fieldsHeightSum / 2);

  const monthlyStatsRowsHeights = {
    topPadding: monthlyStats.padding + additionalPadding,
    firstField: fieldHeight,
    gap: monthlyStats.gap + additionalGap,
    secondField: fieldHeight,
    bottomPadding: monthlyStats.padding + additionalPadding,
  };

  const monthlyStatsColumnsPixelRanges: {
    [key in typeof monthlyStatsColumnsWidthsKeys[number]]: [number, number];
  } = {} as any;

  let leftOffset = 0;
  const columnPoints = [0];

  for (const monthlyStatsColumn of monthlyStatsColumnsWidthsKeys) {
    const columnWidth = monthlyStatsColumnsWidths[monthlyStatsColumn];
    const nextColumnLeftOffset = leftOffset + columnWidth;
    monthlyStatsColumnsPixelRanges[monthlyStatsColumn] = [
      leftOffset,
      nextColumnLeftOffset,
    ];
    columnPoints.push(nextColumnLeftOffset);
    leftOffset = nextColumnLeftOffset;
  }
  const monthlyStatsRowsPixelRanges: {
    [key in typeof monthlyStatsRowsHeightsKeys[number]]: [number, number];
  } = {} as any;

  const rowPoints: number[] = [];

  for (const monthlyStatsHeight of monthlyStatsRowsHeightsKeys) {
    const rowHeight = monthlyStatsRowsHeights[monthlyStatsHeight];
    const nextRowTopOffset = topOffset + rowHeight;
    monthlyStatsRowsPixelRanges[monthlyStatsHeight] = [
      topOffset,
      nextRowTopOffset,
    ];
    rowPoints.push(nextRowTopOffset);
    topOffset = nextRowTopOffset;
  }

  const monthlyStatsMergesWidths = {
    topPadding: fullWidth,
    firstField: { leftPadding, names, gap, values, rightPadding } as const,
    gap: fullWidth,
    secondField: { leftPadding, names, gap, values, rightPadding } as const,
    bottomPadding: fullWidth,
  } as const;

  const getMonthlyStatsRanges = (
    sortedUniqueColumnPoints: number[],
    sortedUniqueRowPoints: number[],
  ) =>
    getElementRanges(
      monthlyStatsColumnsPixelRanges,
      monthlyStatsRowsPixelRanges,
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      monthlyStatsRowsHeightsKeys,
      monthlyStatsMergesWidths,
      leftPadding,
      rightPadding,
      topPadding,
      bottomPadding,
    );

  return {
    monthlyStatsRowsPoints: rowPoints,
    monthlyStatsColumnsPoints: columnPoints,
    getMonthlyStatsRanges,
    topOffset,
  };
};
