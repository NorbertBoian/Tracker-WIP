import { getElementRanges } from "./getElementRanges";
import { getWidthsFromRatio } from "./getWidthsFromRatio";

const generalSettingsColumnsWidthsKeys = [
  "leftPadding",
  "leftFieldsNames",
  "leftFieldsValues",
  "gap",
  "rightFieldsNames",
  "rightFieldsValues",
  "rightPadding",
] as const;

const generalSettingsRowsHeightsKeys = [
  "topPadding",
  "firstRow",
  "firstGap",
  "secondRow",
  "secondGap",
  "thirdRow",
  "bottomPadding",
] as const;

const fullWidth = "fullWidth" as const;
const leftPadding = "leftPadding" as const;
const rightPadding = "rightPadding" as const;
const topPadding = "topPadding" as const;
const bottomPadding = "bottomPadding" as const;
const gap = "gap" as const;
const leftFieldsNames = "leftFieldsNames" as const;
const leftFieldsValues = "leftFieldsValues" as const;
const rightFieldsNames = "rightFieldsNames" as const;
const rightFieldsValues = "rightFieldsValues" as const;

export const getGeneralMonthSettingsPoints = (
  generalSettings: {
    width: number;
    gridColumns: number;
    fieldGridColumns: number;
    fieldHeight: number;
    inlineGap: number;
    blockGap: number;
    padding: number;
  },
  topOffset: number,
  viewportWidth: number,
) => {
  const generalSettingsWidthWithoutWhitespace =
    generalSettings.width -
    generalSettings.padding * 2 -
    generalSettings.inlineGap;

  const [leftFieldsWidth, rightFieldsWidth] = getWidthsFromRatio(
    generalSettings.gridColumns,
    generalSettingsWidthWithoutWhitespace,
  );

  const [leftFieldsNamesWidth, leftFieldsValuesWidth] = getWidthsFromRatio(
    generalSettings.fieldGridColumns,
    leftFieldsWidth,
  );

  const [rightFieldsNamesWidth, rightFieldsValuesWidth] = getWidthsFromRatio(
    generalSettings.fieldGridColumns,
    rightFieldsWidth,
  );

  const inlineMarginSum = viewportWidth - generalSettings.width;

  const leftMarginWidth = Math.floor(inlineMarginSum / 2);

  const generalSettingsColumnsWidths = {
    leftPadding: generalSettings.padding,
    leftFieldsNames: leftFieldsNamesWidth,
    leftFieldsValues: leftFieldsValuesWidth,
    gap: generalSettings.inlineGap,
    rightFieldsNames: rightFieldsNamesWidth,
    rightFieldsValues: rightFieldsValuesWidth,
    rightPadding: generalSettings.padding,
  };

  const generalSettingsRowsHeights = {
    topPadding: generalSettings.padding,
    firstRow: generalSettings.fieldHeight,
    firstGap: generalSettings.blockGap,
    secondRow: generalSettings.fieldHeight,
    secondGap: generalSettings.blockGap,
    thirdRow: generalSettings.fieldHeight,
    bottomPadding: generalSettings.padding,
  };

  const generalSettingsColumnsPixelRanges: {
    [key in typeof generalSettingsColumnsWidthsKeys[number]]: [number, number];
  } = {} as any;

  let leftOffset = leftMarginWidth;
  const columnPoints = [0, leftMarginWidth];

  for (const generalSettingsColumn of generalSettingsColumnsWidthsKeys) {
    const columnWidth = generalSettingsColumnsWidths[generalSettingsColumn];
    const nextColumnLeftOffset = leftOffset + columnWidth;
    generalSettingsColumnsPixelRanges[generalSettingsColumn] = [
      leftOffset,
      nextColumnLeftOffset,
    ];
    columnPoints.push(nextColumnLeftOffset);
    leftOffset = nextColumnLeftOffset;
  }
  const generalSettingsRowsPixelRanges: {
    [key in typeof generalSettingsRowsHeightsKeys[number]]: [number, number];
  } = {} as any;

  const rowPoints: number[] = [topOffset];

  for (const generalSettingsHeight of generalSettingsRowsHeightsKeys) {
    const rowHeight = generalSettingsRowsHeights[generalSettingsHeight];
    const nextRowTopOffset = topOffset + rowHeight;
    generalSettingsRowsPixelRanges[generalSettingsHeight] = [
      topOffset,
      nextRowTopOffset,
    ];
    rowPoints.push(nextRowTopOffset);
    topOffset = nextRowTopOffset;
  }

  const generalSettingsMergesWidths = {
    topPadding: fullWidth,
    firstRow: {
      leftPadding,
      leftFieldsNames,
      leftFieldsValues,
      gap,
      rightFieldsNames,
      rightFieldsValues,
      rightPadding,
    },
    firstGap: fullWidth,
    secondRow: {
      leftPadding,
      leftFieldsNames,
      leftFieldsValues,
      gap,
      rightFieldsNames,
      rightFieldsValues,
      rightPadding,
    },
    secondGap: fullWidth,
    thirdRow: {
      leftPadding,
      leftFieldsNames,
      leftFieldsValues,
      gap,
      rightFieldsNames,
      rightFieldsValues,
      rightPadding,
    },
    bottomPadding: fullWidth,
  } as const;

  const getGeneralSettingsRanges = (
    sortedUniqueColumnPoints: number[],
    sortedUniqueRowPoints: number[],
  ) =>
    getElementRanges(
      generalSettingsColumnsPixelRanges,
      generalSettingsRowsPixelRanges,
      sortedUniqueColumnPoints,
      sortedUniqueRowPoints,
      generalSettingsRowsHeightsKeys,
      generalSettingsMergesWidths,
      leftPadding,
      rightPadding,
      topPadding,
      bottomPadding,
    );

  return {
    generalSettingsRowsPoints: rowPoints,
    generalSettingsColumnsPoints: columnPoints,
    getGeneralSettingsRanges,
    topOffset,
  };
};
