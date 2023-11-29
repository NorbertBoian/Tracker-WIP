export const getDimensionsResizeRequests = (
  sheetId: number,
  dimension: "COLUMNS" | "ROWS",
  sortedUniqueDimensionPoints: number[],
) => {
  const resizeRequests: {
    updateDimensionProperties: {
      properties: { pixelSize: number };
      fields: "pixelSize";
      range: {
        sheetId: number;
        dimension: "COLUMNS" | "ROWS";
        startIndex: number;
        endIndex: number;
      };
    };
  }[] = [];

  const lastDimensionPoint = sortedUniqueDimensionPoints.reduce(
    (prev, value, index) => {
      const size = value - prev;
      const request = {
        updateDimensionProperties: {
          properties: { pixelSize: dimension === "COLUMNS" ? size - 1 : size }, //Subtracting right border of 1 px
          fields: "pixelSize",
          range: {
            sheetId,
            dimension,
            startIndex: index - 1,
            endIndex: index + 1,
          },
        },
      } as const;
      resizeRequests.push(request);
      return value;
    },
  );
  return resizeRequests;
};
