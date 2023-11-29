export const getElementRanges = <
  T extends string,
  B extends string,
  L extends string,
  R extends string,
  Columns extends string,
  Rows extends string,
>(
  elementColumnsPixelRanges: { [key in Columns | L | R]: [number, number] },
  elementRowsPixelRanges: { [key in Rows | T | B]: [number, number] },
  sortedUniqueColumnPoints: number[],
  sortedUniqueRowPoints: number[],
  elementRowsHeightsKeys: Readonly<(Rows | T | B)[]>,
  elementMergesWidths: {
    [key in Rows | T | B]:
      | "fullWidth"
      | { [key in Columns | L | R]: Columns | L | R };
  },
  leftmostMerge: L,
  rightmostMerge: R,
  highestMerge: T,
  lowestMerge: B,
) => {
  const elementColumnsIndexRanges: {
    [key in Columns | L | R]: [number, number];
  } = {} as any;

  for (const key in elementColumnsPixelRanges) {
    const castedKey = key as keyof typeof elementColumnsPixelRanges;
    elementColumnsIndexRanges[castedKey] = elementColumnsPixelRanges[
      castedKey
    ].map((pixels) => sortedUniqueColumnPoints.indexOf(pixels)) as [
      number,
      number,
    ];
  }

  const widthRanges: {
    [key in keyof typeof elementColumnsPixelRanges | "fullWidth"]: {
      startColumnIndex: number;
      endColumnIndex: number;
    };
  } = {
    fullWidth: {
      startColumnIndex: elementColumnsIndexRanges[leftmostMerge][0],
      endColumnIndex: elementColumnsIndexRanges[rightmostMerge][1],
    },
  } as any;

  for (const key in elementColumnsPixelRanges) {
    const castedKey = key as keyof typeof elementColumnsPixelRanges;
    widthRanges[castedKey] = {
      startColumnIndex: elementColumnsIndexRanges[castedKey][0],
      endColumnIndex: elementColumnsIndexRanges[castedKey][1],
    };

    elementColumnsIndexRanges[castedKey] = elementColumnsPixelRanges[
      castedKey
    ].map((pixels) => sortedUniqueColumnPoints.indexOf(pixels)) as [
      number,
      number,
    ];
  }

  const elementFirstRowPixelRangeStart =
    elementRowsPixelRanges[highestMerge][0];
  const elementFirstRowIndexRangeStart = sortedUniqueRowPoints.indexOf(
    elementFirstRowPixelRangeStart,
  );

  const elementLastRowPixelRangeEnd = elementRowsPixelRanges[lowestMerge][1];
  const elementLastRowIndexRangeEnd = sortedUniqueRowPoints.indexOf(
    elementLastRowPixelRangeEnd,
  );

  const elementRanges: {
    [elementRow in typeof elementRowsHeightsKeys[number] | "wholeElement"]:
      | {
          startColumnIndex: number;
          endColumnIndex: number;
          startRowIndex: number;
          endRowIndex: number;
        }
      | {
          [elementColumn in keyof typeof elementColumnsPixelRanges]: {
            startColumnIndex: number;
            endColumnIndex: number;
            startRowIndex: number;
            endRowIndex: number;
          };
        };
  } = {
    wholeElement: {
      startColumnIndex: elementColumnsIndexRanges[leftmostMerge][0],
      endColumnIndex: elementColumnsIndexRanges[rightmostMerge][1],
      startRowIndex: elementFirstRowIndexRangeStart,
      endRowIndex: elementLastRowIndexRangeEnd,
    },
  } as any;

  for (const elementRow of elementRowsHeightsKeys) {
    const start = elementRowsPixelRanges[elementRow][0];
    const startRow = sortedUniqueRowPoints.indexOf(start);
    const end = elementRowsPixelRanges[elementRow][1];
    const endRow = sortedUniqueRowPoints.indexOf(end);

    const heightRange = {
      startRowIndex: startRow,
      endRowIndex: endRow,
    };

    let rowMerges:
      | {
          startColumnIndex: number;
          endColumnIndex: number;
          startRowIndex: number;
          endRowIndex: number;
        }
      | {
          [key in keyof typeof elementColumnsPixelRanges]: {
            startColumnIndex: number;
            endColumnIndex: number;
            startRowIndex: number;
            endRowIndex: number;
          };
        } = {} as {
      [key in keyof typeof elementColumnsPixelRanges]: {
        startColumnIndex: number;
        endColumnIndex: number;
        startRowIndex: number;
        endRowIndex: number;
      };
    };

    const elementRowMergesStrings = elementMergesWidths[elementRow];
    if (
      elementRowMergesStrings &&
      typeof elementRowMergesStrings === "object"
    ) {
      for (const column in elementRowMergesStrings) {
        const castedColumn = column as unknown as Columns;

        rowMerges[castedColumn] = {
          ...widthRanges[castedColumn],
          ...heightRange,
        };
      }
    } else {
      rowMerges = {
        ...widthRanges[elementRowMergesStrings as "fullWidth"],
        ...heightRange,
      };
    }
    elementRanges[elementRow] = rowMerges;
  }
  return elementRanges;
};
