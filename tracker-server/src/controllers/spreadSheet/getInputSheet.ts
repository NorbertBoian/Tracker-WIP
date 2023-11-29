import {
  friday,
  monday,
  saturday,
  sunday,
  thursday,
  tuesday,
  wednesday,
} from "../../constants";
import { IDate } from "../../utils/getEmptyDatesArray";
import { getDaysPoints } from "./getDaysPoints";
import { getDimensionsResizeRequests } from "./getDimensionsResizeRequests";
import { getMergesFromElementRanges } from "./getMergesFromElementRanges";
import { getMonthlyStatsPoints } from "./getMonthlyStatsPoints";
import { getTimesValues } from "./getTimesValues";
import {
  Schema$CellData,
  Schema$ConditionalFormatRule,
  Schema$GridRange,
  Schema$Sheet,
} from "./googleApiTypes";
import { hsvToRgb } from "./hsvToRgb";

export const getInputSheet = (
  topOffset: number,
  {
    monthlyStatsRowsPoints,
    monthlyStatsColumnsPoints,
    getMonthlyStatsRanges,
  }: Omit<ReturnType<typeof getMonthlyStatsPoints>, "topOffset">,
  daysContainerWhitespace: {
    daysContainerLeftMargin: number;
    daysContainerRightMargin: number;
    daysPerRow: number;
    dayContainerInlineGapWidth: number;
    dayContainerRows: number;
    daysInLastRow: number;
  },
  monthSettingsValuesRanges: {
    general: {
      hourlyRate: [number, number];
      languageCode: [number, number];
      overtimeMultiplier: [number, number];
      month: [number, number];
      displayedCurrency: [number, number];
      year: [number, number];
    };
    weekdays: {
      requiredHours: [number, number];
      disabledDay: [number, number];
    }[];
  },
  filteredDates: IDate[],
  weekdaysColors: {
    sunday: [number, number, number];
    monday: [number, number, number];
    tuesday: [number, number, number];
    wednesday: [number, number, number];
    thursday: [number, number, number];
    friday: [number, number, number];
    saturday: [number, number, number];
  },
  viewportWidth: number,
  topMargin: number,
  bottomMargin: number,
  monthlyStats: {
    width: number;
    height: number;
    gridColumns: number;
    gap: number;
    padding: number;
  },
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
  daysContainer: {
    topMargin: number;
    minInlineMargin: number;
    minHorizontalGridGap: number;
    verticalGridGap: number;
  },
) => {
  const {
    daysRowsPoints,
    daysColumnsPoints,
    getDaysRanges,
    topOffset: newTopOffset,
  } = getDaysPoints(
    day,
    daysContainerWhitespace,
    viewportWidth,
    daysContainer,
    topOffset,
  );

  topOffset = newTopOffset;

  const columnPoints = [
    0,
    ...daysColumnsPoints,
    ...monthlyStatsColumnsPoints,
    viewportWidth - monthlyStats.width,
    viewportWidth,
  ];
  const rowPoints = [
    0,
    topMargin,
    ...daysRowsPoints,
    ...monthlyStatsRowsPoints,
    topOffset + bottomMargin,
  ];

  const sortedUniqueColumnPoints = [...new Set(columnPoints)].sort(
    (a, b) => a - b,
  );
  const sortedUniqueRowPoints = [...new Set(rowPoints)].sort((a, b) => a - b);

  const headingColumnsPixelRange = [
    monthlyStatsColumnsPoints.at(-1),
    viewportWidth - monthlyStats.width,
  ];

  const headingColumnsIndexRange = headingColumnsPixelRange.map((pixels) =>
    sortedUniqueColumnPoints.indexOf(pixels as number),
  );

  const headingRowsPixelRange = [0, daysRowsPoints[0]];

  const headingRowsIndexRange = headingRowsPixelRange.map((pixels) =>
    sortedUniqueRowPoints.indexOf(pixels as number),
  );

  const monthlyStatsRanges = getMonthlyStatsRanges(
    sortedUniqueColumnPoints,
    sortedUniqueRowPoints,
  );

  const daysRanges = getDaysRanges(
    sortedUniqueColumnPoints,
    sortedUniqueRowPoints,
  );

  const daysInputValuesRanges = daysRanges.map((dayRanges) => {
    let ranges = {
      began: undefined as unknown as [number, number],
      ended: undefined as unknown as [number, number],
    };
    if ("field" in dayRanges.firstField && "field" in dayRanges.secondField)
      ranges = {
        began: [
          dayRanges.firstField.field.startRowIndex,
          dayRanges.firstField.field.startColumnIndex,
        ],
        ended: [
          dayRanges.secondField.field.startRowIndex,
          dayRanges.secondField.field.startColumnIndex,
        ],
      };
    return ranges;
  });

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

  const monthlyStatsMerges = getMergesFromElementRanges(monthlyStatsRanges);

  const columnCount = sortedUniqueColumnPoints.length - 1;
  const rowCount = sortedUniqueRowPoints.length - 1;

  const columnsResizeRequests = getDimensionsResizeRequests(
    0,
    "COLUMNS",
    sortedUniqueColumnPoints,
  );

  const rowsResizeRequests = getDimensionsResizeRequests(
    0,
    "ROWS",
    sortedUniqueRowPoints,
  );

  const grid: Schema$CellData[][] = Array.from(
    { length: sortedUniqueRowPoints.length - 1 },
    (unused) =>
      Array.from({ length: sortedUniqueColumnPoints.length - 1 }, () => ({
        userEnteredFormat: {
          backgroundColorStyle: { themeColor: "BACKGROUND" },
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
      firstField,
      secondField,
      dateRow,
      holidayRow,
      weekdayRow,
      wholeElement,
    } = dayRanges;

    if ("startRowIndex" in wholeElement) {
      updateGrid(wholeElement, {
        userEnteredFormat: {
          backgroundColorStyle: { themeColor: "ACCENT1" },
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
            foregroundColor: {
              red: 207 / 255,
              green: 204 / 255,
              blue: 204 / 255,
            },
          },
        },
      });
    }
    if ("startRowIndex" in holidayRow) {
      updateGrid(holidayRow, {
        userEnteredValue: {
          formulaValue: `=IF(Computed!$H$${
            index + 2
          },UPPER(Computed!$B$64),"")`,
        },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: `=INDIRECT("RC",FALSE)=IF(Computed!$H$${
                  index + 2
                },UPPER(Computed!$B$64),"")`,
              },
            ],
          },
          strict: true,
        },
        userEnteredFormat: {
          textFormat: {
            fontSize: 8,
            foregroundColor: {
              red: 222 / 255,
              green: 213 / 255,
              blue: 62 / 255,
            },
          },
        },
      });
    }

    const [beganTime, endedTime] = getTimesValues(filteredDates[index]);

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
          strict: false,
        },
        userEnteredFormat: {
          textFormat: {
            foregroundColor: {
              red: 225 / 255,
              green: 225 / 255,
              blue: 225 / 255,
            },
          },
        },
      });
    }
    if ("field" in firstField) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `began_${`0${index}`.slice(-2)}`,
            name: `began_${`0${index}`.slice(-2)}`,
            range: { sheetId: 0, ...firstField.field },
          },
        },
      });
      updateGrid(firstField.field, {
        userEnteredFormat: {
          backgroundColorStyle: { themeColor: "ACCENT2" },
          numberFormat: { type: "TIME", pattern: "[hh]:mm" },
        },
        userEnteredValue: beganTime,
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue:
                  '=AND(GTE(INDIRECT("RC",FALSE),0),LTE(INDIRECT("RC",FALSE),1))',
              },
            ],
          },
          strict: false,
        },
      });
    }

    if ("field" in secondField) {
      namedRangesRequests.push({
        addNamedRange: {
          namedRange: {
            namedRangeId: `ended_${`0${index}`.slice(-2)}`,
            name: `ended_${`0${index}`.slice(-2)}`,
            range: { sheetId: 0, ...secondField.field },
          },
        },
      });
      updateGrid(secondField.field, {
        userEnteredFormat: {
          backgroundColorStyle: { themeColor: "ACCENT3" },
          numberFormat: { type: "TIME", pattern: "[hh]:mm" },
        },
        userEnteredValue: endedTime,
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue:
                  '=AND(GTE(INDIRECT("RC",FALSE),0),LTE(INDIRECT("RC",FALSE),1))',
              },
            ],
          },
          strict: true,
        },
      });
    }
  });

  const { firstField, secondField, wholeElement } = monthlyStatsRanges;

  if ("startRowIndex" in wholeElement) {
    updateGrid(wholeElement, {
      userEnteredFormat: {
        backgroundColorStyle: { themeColor: "ACCENT4" },
      },
    });
  }

  if ("values" in firstField) {
    updateGrid(firstField.names, {
      userEnteredValue: { formulaValue: "=Computed!$B$59" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$59',
            },
          ],
        },
        strict: true,
      },
      userEnteredFormat: {
        textFormat: {
          foregroundColor: {
            red: 197 / 255,
            green: 195 / 255,
            blue: 195 / 255,
          },
        },
      },
    });
    updateGrid(firstField.values, {
      userEnteredFormat: {
        backgroundColorStyle: { themeColor: "ACCENT5" },
        textFormat: {
          foregroundColor: {
            red: 197 / 255,
            green: 195 / 255,
            blue: 195 / 255,
          },
        },
      },
      userEnteredValue: {
        formulaValue: `=TEXT(Computed!$B$35,"0.00")&" "&INDIRECT("'Month Settings'!R${
          monthSettingsValuesRanges.general.displayedCurrency[0] + 1
        }C${
          monthSettingsValuesRanges.general.displayedCurrency[1] + 1
        }",FALSE)`,
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=INDIRECT("RC",FALSE)=TEXT(Computed!$B$35,"0.00")&" "&INDIRECT("'Month Settings'!R${
                monthSettingsValuesRanges.general.displayedCurrency[0] + 1
              }C${
                monthSettingsValuesRanges.general.displayedCurrency[1] + 1
              }",FALSE)`,
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("values" in secondField) {
    updateGrid(secondField.names, {
      userEnteredValue: { formulaValue: "=Computed!$B$60" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$60',
            },
          ],
        },
        strict: true,
      },
      userEnteredFormat: {
        textFormat: {
          foregroundColor: {
            red: 197 / 255,
            green: 195 / 255,
            blue: 195 / 255,
          },
        },
      },
    });
    updateGrid(secondField.values, {
      userEnteredFormat: {
        backgroundColorStyle: { themeColor: "ACCENT5" },
        textFormat: {
          foregroundColor: {
            red: 197 / 255,
            green: 195 / 255,
            blue: 195 / 255,
          },
        },
      },
      userEnteredValue: {
        formulaValue:
          '=FLOOR(Computed!$A$35*24)&" "&Computed!$B$61&" "&MINUTE(Computed!$A$35)&" "&Computed!$B$62',
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue:
                '=INDIRECT("RC",FALSE)=FLOOR(Computed!$A$35*24)&" "&Computed!$B$61&" "&MINUTE(Computed!$A$35)&" "&Computed!$B$62',
            },
          ],
        },
        strict: true,
      },
    });
  }

  updateGrid(headingRange, {
    userEnteredValue: {
      formulaValue: `=Computed!$N$5&" "&INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.year[0] + 1
      }C${monthSettingsValuesRanges.general.year[1] + 1}",FALSE)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=Computed!$N$5&" "&INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.year[0] + 1
            }C${monthSettingsValuesRanges.general.year[1] + 1}",FALSE)`,
          },
        ],
      },
      strict: true,
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
  });

  const rowData = grid.map((row) => ({ values: row }));

  const unprotectedRanges = [];

  for (const dayRanges of daysRanges) {
    const { firstField, secondField } = dayRanges;

    if ("field" in firstField) {
      unprotectedRanges.push({ ...firstField.field, sheetId: 0 });
    }
    if ("field" in secondField) {
      unprotectedRanges.push({ ...secondField.field, sheetId: 0 });
    }
  }

  const hiddenDaysConditionalFormatRules: Schema$ConditionalFormatRule[] = [];
  const weekdayRowsRanges: Schema$GridRange[] = [];

  for (const dayRanges of daysRanges) {
    const { wholeElement, weekdayRow } = dayRanges;
    if (
      "startColumnIndex" in weekdayRow &&
      "startColumnIndex" in wholeElement
    ) {
      weekdayRowsRanges.push({ sheetId: 0, ...weekdayRow });
      hiddenDaysConditionalFormatRules.push({
        ranges: [{ ...wholeElement, sheetId: 0 }],
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

  const weekdays = [
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  ];

  const weekdaysNamesColorsConditionalFormatRules: Schema$ConditionalFormatRule[] =
    [];

  weekdays.forEach((weekday, index) => {
    const [red, green, blue] = hsvToRgb(weekdaysColors[weekday]);
    weekdaysNamesColorsConditionalFormatRules.push({
      ranges: weekdayRowsRanges,
      booleanRule: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=MATCH(INDIRECT("RC",FALSE), INDIRECT("Computed!$B$40"):INDIRECT("Computed!$B$46"),0)=${
                index + 1
              }`,
            },
          ],
        },
        format: {
          textFormat: {
            foregroundColor: {
              red,
              green,
              blue,
            },
          },
        },
      },
    });
  });

  const inputSheetRequests = [
    ...columnsResizeRequests,
    ...rowsResizeRequests,
    ...namedRangesRequests,
  ];

  const inputSheet: Schema$Sheet = {
    properties: {
      title: "Input",
      sheetType: "GRID",
      sheetId: 0,
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
    merges: [...daysMerges, ...monthlyStatsMerges, headingRange].map(
      (range) => ({
        ...range,
        sheetId: 0,
      }),
    ),
    protectedRanges: [{ range: { sheetId: 0 }, unprotectedRanges }],
    conditionalFormats: [
      ...hiddenDaysConditionalFormatRules,
      ...weekdaysNamesColorsConditionalFormatRules,
    ],
  };

  return {
    inputSheet,
    inputSheetRequests,
    daysInputValuesRanges,
  };
};
