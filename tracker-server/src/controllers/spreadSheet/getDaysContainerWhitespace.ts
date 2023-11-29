export const getDaysContainerWhitespace = (
  daysContainer: {
    topMargin: number;
    minInlineMargin: number;
    minHorizontalGridGap: number;
    verticalGridGap: number;
  },
  viewportWidth: number,
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
) => {
  const daysContainerElementMaxWidth =
    viewportWidth - daysContainer.minInlineMargin * 2;
  const daysPerRow = Math.floor(
    (daysContainerElementMaxWidth + daysContainer.minHorizontalGridGap) / //Added to balance out the excess one in divisor, as there will be one less than there are days
      (day.width + daysContainer.minHorizontalGridGap),
  );

  let spareWhitespace = Math.floor(
    (daysContainerElementMaxWidth + daysContainer.minHorizontalGridGap) %
      (day.width + daysContainer.minHorizontalGridGap),
  );

  const additionalInlineGapsAndMargins = Math.floor(
    spareWhitespace / (daysPerRow + 1),
  ); //Adding one to account for both inline margins

  spareWhitespace = (spareWhitespace % daysPerRow) + 1;

  const daysContainerAdditionalLeftMargin = Math.floor(spareWhitespace / 2);
  const daysContainerAdditionalRightMargin = Math.ceil(spareWhitespace / 2);

  const daysContainerLeftMargin =
    daysContainer.minInlineMargin +
    additionalInlineGapsAndMargins +
    daysContainerAdditionalLeftMargin;

  const daysContainerRightMargin =
    daysContainer.minInlineMargin +
    additionalInlineGapsAndMargins +
    daysContainerAdditionalRightMargin;

  const dayContainerInlineGapWidth =
    daysContainer.minHorizontalGridGap + additionalInlineGapsAndMargins;

  const dayContainerRows = Math.ceil(31 / daysPerRow);

  const daysInLastRow = 31 % daysPerRow;

  return {
    daysContainerLeftMargin,
    daysContainerRightMargin,
    daysPerRow,
    dayContainerInlineGapWidth,
    dayContainerRows,
    daysInLastRow,
  };
};
