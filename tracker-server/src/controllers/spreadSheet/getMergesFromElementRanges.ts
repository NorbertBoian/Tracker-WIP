export const getMergesFromElementRanges = (elementRanges: {
  [elementRow: string]:
    | {
        startColumnIndex: number;
        endColumnIndex: number;
        startRowIndex: number;
        endRowIndex: number;
      }
    | {
        [elementColumn: string]: {
          startColumnIndex: number;
          endColumnIndex: number;
          startRowIndex: number;
          endRowIndex: number;
        };
      };
}) => {
  const elementMerges: {
    startColumnIndex: number;
    endColumnIndex: number;
    startRowIndex: number;
    endRowIndex: number;
  }[] = [];

  const { wholeElement: unused, ...rest } = elementRanges;
  for (const row in rest) {
    if ("startColumnIndex" in rest[row]) elementMerges.push(rest[row] as any);
    else {
      for (const column in rest[row]) {
        const castedColumn = column as keyof typeof rest[keyof typeof rest];
        elementMerges.push(rest[row][castedColumn] as any);
      }
    }
  }
  return elementMerges;
};
