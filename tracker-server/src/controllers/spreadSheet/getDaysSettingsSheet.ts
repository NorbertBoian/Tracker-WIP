import { IDate } from "../../utils/getEmptyDatesArray";
import { getDaysSettingsRanges } from "./getDaysSettingsRanges";
import { getDimensionsResizeRequests } from "./getDimensionsResizeRequests";
import { getMergesFromElementRanges } from "./getMergesFromElementRanges";
import {
  Schema$CellData,
  Schema$ConditionalFormatRule,
  Schema$GridRange,
  Schema$Sheet,
} from "./googleApiTypes";

export const getDaysSettingsSheet = (
  daysContainerWhitespace: {
    daysContainerLeftMargin: number;
    daysContainerRightMargin: number;
    daysPerRow: number;
    dayContainerInlineGapWidth: number;
    dayContainerRows: number;
    daysInLastRow: number;
  },
  filteredDates: IDate[],
  viewportWidth: number,
  day: {
    width: number;
    height: number;
    padding: number;
    gridColumns: number;
    weekdayRowHeight: number;
    dateRowHeight: number;
    gap: number;
  },
  daysContainer: {
    topMargin: number;
    verticalGridGap: number;
    bottomMargin: number;
  },
) => {
  const { daysRanges, sortedUniqueColumnPoints, sortedUniqueRowPoints } =
    getDaysSettingsRanges(
      day,
      daysContainerWhitespace,
      viewportWidth,
      daysContainer,
    );

  const daysSettingsValuesRanges = daysRanges.map((dayRanges) => {
    let ranges = {
      hourlyRate: undefined as unknown as [number, number],
      overtimeMultiplier: undefined as unknown as [number, number],
      requiredHours: undefined as unknown as [number, number],
      isHoliday: undefined as unknown as [number, number],
    };
    if (
      "values" in dayRanges.hourlyRateRow &&
      "values" in dayRanges.overtimeMultiplierRow &&
      "values" in dayRanges.requiredHoursRow &&
      "values" in dayRanges.isHolidayRow
    )
      ranges = {
        hourlyRate: [
          dayRanges.hourlyRateRow.values.startRowIndex,
          dayRanges.hourlyRateRow.values.startColumnIndex,
        ],
        overtimeMultiplier: [
          dayRanges.overtimeMultiplierRow.values.startRowIndex,
          dayRanges.overtimeMultiplierRow.values.startColumnIndex,
        ],
        requiredHours: [
          dayRanges.requiredHoursRow.values.startRowIndex,
          dayRanges.requiredHoursRow.values.startColumnIndex,
        ],
        isHoliday: [
          dayRanges.isHolidayRow.values.startRowIndex,
          dayRanges.isHolidayRow.values.startColumnIndex,
        ],
      };
    return ranges;
  });

  const headingColumnsPixelRange = [0, viewportWidth];

  const headingColumnsIndexRange = headingColumnsPixelRange.map((pixels) =>
    sortedUniqueColumnPoints.indexOf(pixels as number),
  );

  const headingRowsPixelRange = [0, daysContainer.topMargin];

  const headingRowsIndexRange = headingRowsPixelRange.map((pixels) =>
    sortedUniqueRowPoints.indexOf(pixels as number),
  );

  const headingRange = {
    startColumnIndex: headingColumnsIndexRange[0],
    endColumnIndex: headingColumnsIndexRange[1],
    startRowIndex: headingRowsIndexRange[0],
    endRowIndex: headingRowsIndexRange[1],
  };

  const daysMerges: {
    startColumnIndex: number;
    endColumnIndex: number;
    startRowIndex: number;
    endRowIndex: number;
  }[] = [];

  daysRanges.forEach((dayRanges) => {
    daysMerges.push(...getMergesFromElementRanges(dayRanges));
  });

  const columnCount = sortedUniqueColumnPoints.length - 1;
  const rowCount = sortedUniqueRowPoints.length - 1;

  const columnsResizeRequests = getDimensionsResizeRequests(
    2,
    "COLUMNS",
    sortedUniqueColumnPoints,
  );

  const rowsResizeRequests = getDimensionsResizeRequests(
    2,
    "ROWS",
    sortedUniqueRowPoints,
  );

  const grid: Schema$CellData[][] = Array.from({ length: rowCount }, (unused) =>
    Array.from({ length: columnCount }, () => ({
      userEnteredFormat: {
        backgroundColorStyle: { themeColor: "BACKGROUND" },
        textFormat: {
          foregroundColor: {
            red: 197 / 255,
            green: 195 / 255,
            blue: 195 / 255,
          },
        },
        horizontalAlignment: "CENTER",
        verticalAlignment: "MIDDLE",
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=""',
            },
          ],
        },
        strict: true,
      },
    })),
  );

  const isObject = <T>(item: T) =>
    typeof item === "object" && item !== null && !Array.isArray(item)
      ? item
      : false;

  const mergeRequests = (
    firstRequest: Schema$CellData,
    secondRequest: Schema$CellData,
  ) => {
    const merge: Schema$CellData = firstRequest;
    for (const key in secondRequest) {
      const castedKey = key as keyof typeof secondRequest;
      const firstRequestValueObject = isObject(firstRequest[castedKey]);
      const secondRequestValueObject = isObject(secondRequest[castedKey]);
      if (firstRequestValueObject && secondRequestValueObject)
        merge[castedKey] = {
          ...firstRequestValueObject,
          ...secondRequestValueObject,
        } as any;
      else {
        merge[castedKey] = secondRequest[castedKey] as any;
      }
    }

    return merge;
  };

  const updateGrid = (
    range: {
      startColumnIndex: number;
      endColumnIndex: number;
      startRowIndex: number;
      endRowIndex: number;
    },
    request: Schema$CellData,
  ) => {
    for (let row = range.startRowIndex; row < range.endRowIndex; row++) {
      for (
        let column = range.startColumnIndex;
        column < range.endColumnIndex;
        column++
      ) {
        const initialRequest = grid[row][column] ? grid[row][column] : {};
        grid[row][column] = mergeRequests(initialRequest, request);
      }
    }
  };

  const namesRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 58 / 255,
          green: 50 / 255,
          blue: 50 / 255,
        },
      },
    },
  };

  const valuesRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 50 / 255,
          green: 43 / 255,
          blue: 43 / 255,
        },
      },
    },
  };

  const rangesToBeCleared: string[] = [];

  const namedRangesRequests: {
    addNamedRange: {
      namedRange: {
        namedRangeId: string;
        name: string;
        range: Schema$GridRange;
      };
    };
  }[] = [];

  daysRanges.forEach((dayRanges, index) => {
    const {
      weekdayRow,
      dateRow,
      hourlyRateRow,
      overtimeMultiplierRow,
      requiredHoursRow,
      isHolidayRow,
      wholeElement,
    } = dayRanges;

    if ("startRowIndex" in wholeElement) {
      updateGrid(wholeElement, {
        userEnteredFormat: {
          backgroundColorStyle: {
            rgbColor: {
              red: 76 / 255,
              green: 66 / 255,
              blue: 66 / 255,
            },
          },
        },
      });
    }
    if ("startRowIndex" in weekdayRow) {
      updateGrid(weekdayRow, {
        userEnteredValue: { formulaValue: `=Computed!$G$${index + 2}` },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: `=INDIRECT("RC",FALSE)=Computed!$G$${
                  index + 2
                }`,
              },
            ],
          },
          strict: true,
        },
        userEnteredFormat: {
          textFormat: {
            fontSize: 12,
            bold: true,
          },
        },
      });
    }
    if ("startRowIndex" in dateRow) {
      updateGrid(dateRow, {
        userEnteredValue: {
          formulaValue: `=DAY(Computed!$F$${index + 2})&" "&Computed!$N$5`,
        },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: `=INDIRECT("RC",FALSE)=DAY(Computed!$F$${
                  index + 2
                })&" "&Computed!$N$5`,
              },
            ],
          },
          strict: true,
        },
      });
    }

    if ("names" in hourlyRateRow) {
      updateGrid(hourlyRateRow.names, {
        ...namesRequest,
        userEnteredValue: { formulaValue: "=Computed!$B$67" },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$67',
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("names" in overtimeMultiplierRow) {
      updateGrid(overtimeMultiplierRow.names, {
        ...namesRequest,
        userEnteredValue: { formulaValue: "=Computed!$B$68" },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$68',
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("names" in requiredHoursRow) {
      updateGrid(requiredHoursRow.names, {
        ...namesRequest,
        userEnteredValue: { formulaValue: "=Computed!$B$76" },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$76',
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("names" in isHolidayRow) {
      updateGrid(isHolidayRow.names, {
        ...namesRequest,
        userEnteredValue: { formulaValue: "=Computed!$B$64" },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$64',
              },
            ],
          },
          strict: true,
        },
      });
    }

    if ("values" in hourlyRateRow) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `hourlyRate_${`0${index}`.slice(-2)}`,
            name: `hourlyRate_${`0${index}`.slice(-2)}`,
            range: { sheetId: 2, ...hourlyRateRow.values },
          },
        },
      });
      if (!filteredDates[index] || !filteredDates[index].hourlyRate) {
        const { startColumnIndex, startRowIndex } = hourlyRateRow.values;
        rangesToBeCleared.push(
          `'Days settings'!R${startRowIndex + 1}C${startColumnIndex + 1}`,
        );
      }
      updateGrid(hourlyRateRow.values, {
        ...valuesRequest,
        ...(filteredDates[index]
          ? {
              userEnteredValue: {
                numberValue: +filteredDates[index].hourlyRate,
              },
            }
          : {}),
        dataValidation: {
          condition: {
            type: "NUMBER_GREATER_THAN_EQ",
            values: [
              {
                userEnteredValue: "0",
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("values" in overtimeMultiplierRow) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `overtimeMultiplier_${`0${index}`.slice(-2)}`,
            name: `overtimeMultiplier_${`0${index}`.slice(-2)}`,
            range: { sheetId: 2, ...overtimeMultiplierRow.values },
          },
        },
      });
      if (!filteredDates[index] || !filteredDates[index].overtimeMultiplier) {
        const { startColumnIndex, startRowIndex } =
          overtimeMultiplierRow.values;
        rangesToBeCleared.push(
          `'Days settings'!R${startRowIndex + 1}C${startColumnIndex + 1}`,
        );
      }
      updateGrid(overtimeMultiplierRow.values, {
        ...valuesRequest,
        ...(filteredDates[index]
          ? {
              userEnteredValue: {
                numberValue: +filteredDates[index].overtimeMultiplier,
              },
            }
          : {}),
        dataValidation: {
          condition: {
            type: "NUMBER_GREATER_THAN_EQ",
            values: [
              {
                userEnteredValue: "0",
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("values" in requiredHoursRow) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `requiredHours_${`0${index}`.slice(-2)}`,
            name: `requiredHours_${`0${index}`.slice(-2)}`,
            range: { sheetId: 2, ...requiredHoursRow.values },
          },
        },
      });
      if (!filteredDates[index] || !filteredDates[index].requiredHours) {
        const { startColumnIndex, startRowIndex } = requiredHoursRow.values;
        rangesToBeCleared.push(
          `'Days settings'!R${startRowIndex + 1}C${startColumnIndex + 1}`,
        );
      }
      updateGrid(requiredHoursRow.values, {
        ...valuesRequest,
        ...(filteredDates[index]
          ? {
              userEnteredValue: {
                numberValue: +filteredDates[index].requiredHours,
              },
            }
          : {}),
        dataValidation: {
          condition: {
            type: "NUMBER_BETWEEN",
            values: [
              {
                userEnteredValue: "0",
              },
              {
                userEnteredValue: "24",
              },
            ],
          },
          strict: true,
        },
      });
    }
    if ("values" in isHolidayRow) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `isHoliday_${`0${index}`.slice(-2)}`,
            name: `isHoliday_${`0${index}`.slice(-2)}`,
            range: { sheetId: 2, ...isHolidayRow.values },
          },
        },
      });
      updateGrid(isHolidayRow.values, {
        ...valuesRequest,
        userEnteredValue: {
          boolValue: filteredDates[index]
            ? filteredDates[index].isHoliday
            : false,
        },
        dataValidation: {
          condition: {
            type: "BOOLEAN",
          },
          strict: true,
        },
      });
    }
  });

  updateGrid(headingRange, {
    userEnteredValue: {
      formulaValue: `=Computed!$B$65`,
    },
    userEnteredFormat: {
      textFormat: {
        fontSize: 20,
        fontFamily: "Oswald",
        foregroundColor: {
          red: 211 / 255,
          green: 211 / 255,
          blue: 211 / 255,
        },
      },
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$65',
          },
        ],
      },
      strict: true,
    },
  });

  const rowData = grid.map((row) => ({ values: row }));

  const unprotectedRanges = [];

  for (const dayRanges of daysRanges) {
    const {
      hourlyRateRow,
      overtimeMultiplierRow,
      requiredHoursRow,
      isHolidayRow,
    } = dayRanges;

    if ("values" in hourlyRateRow) {
      unprotectedRanges.push({ ...hourlyRateRow.values, sheetId: 2 });
    }
    if ("values" in overtimeMultiplierRow) {
      unprotectedRanges.push({ ...overtimeMultiplierRow.values, sheetId: 2 });
    }
    if ("values" in requiredHoursRow) {
      unprotectedRanges.push({ ...requiredHoursRow.values, sheetId: 2 });
    }
    if ("values" in isHolidayRow) {
      unprotectedRanges.push({ ...isHolidayRow.values, sheetId: 2 });
    }
  }

  const hiddenDaysConditionalFormatRules: Schema$ConditionalFormatRule[] = [];

  for (const dayRanges of daysRanges) {
    const { wholeElement, weekdayRow } = dayRanges;
    if (
      "startColumnIndex" in weekdayRow &&
      "startColumnIndex" in wholeElement
    ) {
      hiddenDaysConditionalFormatRules.push({
        ranges: [{ ...wholeElement, sheetId: 2 }],
        booleanRule: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: `=INDIRECT("R${
                  weekdayRow.startRowIndex + 1
                }C${weekdayRow.startColumnIndex + 1}",FALSE)=FALSE`,
              },
            ],
          },
          format: {
            backgroundColorStyle: { themeColor: "BACKGROUND" },
            textFormat: { foregroundColorStyle: { themeColor: "BACKGROUND" } },
          },
        },
      });
    }
  }

  const daysSettingsSheetRequests = [
    ...columnsResizeRequests,
    ...rowsResizeRequests,
    ...namedRangesRequests,
  ];

  const daysSettingsSheet: Schema$Sheet = {
    properties: {
      title: "Days Settings",
      sheetType: "GRID",
      sheetId: 2,
      gridProperties: {
        columnCount,
        hideGridlines: true,
        rowCount,
      },
      hidden: false,
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData,
      },
    ],
    merges: [...daysMerges, headingRange].map((range) => ({
      ...range,
      sheetId: 2,
    })),
    protectedRanges: [{ range: { sheetId: 2 }, unprotectedRanges }],
    conditionalFormats: [...hiddenDaysConditionalFormatRules],
  };

  return {
    daysSettingsSheet,
    daysSettingsSheetRequests,
    daysSettingsValuesRanges,
    rangesToBeCleared,
  };
};
