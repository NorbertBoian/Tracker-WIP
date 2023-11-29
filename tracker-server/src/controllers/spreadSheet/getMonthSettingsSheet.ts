import {
  friday,
  languageCodeType,
  monday,
  monthNumberType,
  saturday,
  sunday,
  thursday,
  tuesday,
  wednesday,
} from "../../constants";
import { disabledDaysType, requiredHoursType } from "../../types/knex";
import { getDimensionsResizeRequests } from "./getDimensionsResizeRequests";
import { getGeneralMonthSettingsPoints } from "./getGeneralMonthSettingsPoints";
import { getMergesFromElementRanges } from "./getMergesFromElementRanges";
import { getWeekdaysSettingsPoints } from "./getWeekdaysSettingsPoints";
import {
  Schema$CellData,
  Schema$GridRange,
  Schema$Sheet,
} from "./googleApiTypes";
import { hsvToRgb } from "./hsvToRgb";

export const getMonthSettingsSheet = (
  headingHeight: number,
  generalSettings: {
    width: number;
    gridColumns: number;
    fieldGridColumns: number;
    fieldHeight: number;
    inlineGap: number;
    blockGap: number;
    padding: number;
  },
  weekday: {
    width: number;
    height: number;
    padding: number;
    gap: number;
    weekdayColumnWidthAddend: number;
    requiredHoursColumnWidthAddend: number;
    disabledDayColumnWidthAddend: number;
    colorColumnWidthAddend: number;
  },
  weekdaysContainer: {
    gap: number;
    blockMargin: number;
  },
  weekdaysColumnsNamesHeight: number,
  viewportWidth: number,
  updateColorButton: {
    width: number;
    height: number;
    buttonWidth: number;
  },
  bottomMargin: number,
  hourlyRate: string,
  overtimeMultiplier: string,
  displayedCurrency: string,
  preferredLanguage: languageCodeType,
  month: monthNumberType,
  year: number,
  requiredHours: requiredHoursType,
  disabledDays: disabledDaysType,
  weekdaysColors: {
    sunday: [number, number, number];
    monday: [number, number, number];
    tuesday: [number, number, number];
    wednesday: [number, number, number];
    thursday: [number, number, number];
    friday: [number, number, number];
    saturday: [number, number, number];
  },
) => {
  const {
    generalSettingsRowsPoints,
    generalSettingsColumnsPoints,
    getGeneralSettingsRanges,
    topOffset: updatedTopOffset,
  } = getGeneralMonthSettingsPoints(
    generalSettings,
    headingHeight,
    viewportWidth,
  );

  let topOffset = updatedTopOffset;

  const rowPoints = [0, ...generalSettingsRowsPoints, topOffset];

  const {
    weekdaysRowsPoints,
    weekdaysColumnsPoints,
    getWeekdaysRanges,
    getWeekdaysColumnsNamesRanges,
    topOffset: newTopOffset,
  } = getWeekdaysSettingsPoints(
    weekday,
    weekdaysContainer,
    weekdaysColumnsNamesHeight,
    viewportWidth,
    topOffset,
  );

  topOffset = newTopOffset;
  rowPoints.push(...weekdaysRowsPoints);

  const updateColorButtonRowsStart = topOffset;

  topOffset += updateColorButton.height;
  rowPoints.push(topOffset);

  const updateColorButtonRowsEnd = topOffset;

  topOffset += bottomMargin;
  rowPoints.push(topOffset);

  const updateColorButtonColumnsEnd = weekdaysColumnsPoints.at(-1) as number;

  const updateColorButtonColumnsStart =
    updateColorButtonColumnsEnd - updateColorButton.width;

  const updateColorButtonColumnsPixelRanges = {
    name: [
      updateColorButtonColumnsStart,
      updateColorButtonColumnsEnd - updateColorButton.buttonWidth,
    ],
    value: [
      updateColorButtonColumnsEnd - updateColorButton.buttonWidth,
      updateColorButtonColumnsEnd,
    ],
  };

  const columnPoints = [
    ...generalSettingsColumnsPoints,
    ...weekdaysColumnsPoints,
    ...updateColorButtonColumnsPixelRanges.name,
    updateColorButtonColumnsPixelRanges.value[1],
  ];

  const sortedUniqueColumnPoints = [...new Set(columnPoints)].sort(
    (a, b) => a - b,
  );
  const sortedUniqueRowPoints = [...new Set(rowPoints)].sort((a, b) => a - b);

  const generalSettingsRanges = getGeneralSettingsRanges(
    sortedUniqueColumnPoints,
    sortedUniqueRowPoints,
  );

  let monthSettingsValuesRanges: {
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
  } = {} as any;

  if (
    "leftFieldsValues" in generalSettingsRanges.firstRow &&
    "leftFieldsValues" in generalSettingsRanges.secondRow &&
    "leftFieldsValues" in generalSettingsRanges.thirdRow
  )
    if ("leftFieldsValues" in generalSettingsRanges.firstRow)
      monthSettingsValuesRanges = {
        ...monthSettingsValuesRanges,
        general: {
          hourlyRate: [
            generalSettingsRanges.firstRow.leftFieldsValues.startRowIndex,
            generalSettingsRanges.firstRow.leftFieldsValues.startColumnIndex,
          ],
          languageCode: [
            generalSettingsRanges.firstRow.rightFieldsValues.startRowIndex,
            generalSettingsRanges.firstRow.rightFieldsValues.startColumnIndex,
          ],
          overtimeMultiplier: [
            generalSettingsRanges.secondRow.leftFieldsValues.startRowIndex,
            generalSettingsRanges.secondRow.leftFieldsValues.startColumnIndex,
          ],
          month: [
            generalSettingsRanges.secondRow.rightFieldsValues.startRowIndex,
            generalSettingsRanges.secondRow.rightFieldsValues.startColumnIndex,
          ],
          displayedCurrency: [
            generalSettingsRanges.thirdRow.leftFieldsValues.startRowIndex,
            generalSettingsRanges.thirdRow.leftFieldsValues.startColumnIndex,
          ],
          year: [
            generalSettingsRanges.thirdRow.rightFieldsValues.startRowIndex,
            generalSettingsRanges.thirdRow.rightFieldsValues.startColumnIndex,
          ],
        },
      };

  const weekdaysColumnsNamesRanges = getWeekdaysColumnsNamesRanges(
    sortedUniqueColumnPoints,
    sortedUniqueRowPoints,
  );

  const weekdaysRanges = getWeekdaysRanges(
    sortedUniqueColumnPoints,
    sortedUniqueRowPoints,
  );

  const weekdaysValuesRanges = weekdaysRanges.map((weekdayRanges) => {
    let ranges = {
      requiredHours: undefined as unknown as [number, number],
      disabledDay: undefined as unknown as [number, number],
    };
    if ("requiredHoursColumn" in weekdayRanges.content)
      ranges = {
        requiredHours: [
          weekdayRanges.content.requiredHoursColumn.startRowIndex,
          weekdayRanges.content.requiredHoursColumn.startColumnIndex,
        ],
        disabledDay: [
          weekdayRanges.content.disabledDayColumn.startRowIndex,
          weekdayRanges.content.disabledDayColumn.startColumnIndex,
        ],
      };
    return ranges;
  });

  monthSettingsValuesRanges = {
    ...monthSettingsValuesRanges,
    weekdays: weekdaysValuesRanges,
  };

  const headingColumnsPixelRange = [0, viewportWidth];

  const headingColumnsIndexRange = headingColumnsPixelRange.map((pixels) =>
    sortedUniqueColumnPoints.indexOf(pixels as number),
  );

  const headingRowsPixelRange = [0, headingHeight];

  const headingRowsIndexRange = headingRowsPixelRange.map((pixels) =>
    sortedUniqueRowPoints.indexOf(pixels as number),
  );

  const updateColorButtonColumnsIndexRange = {
    name: updateColorButtonColumnsPixelRanges.name.map((pixels) =>
      sortedUniqueColumnPoints.indexOf(pixels as number),
    ),
    value: updateColorButtonColumnsPixelRanges.value.map((pixels) =>
      sortedUniqueColumnPoints.indexOf(pixels as number),
    ),
  };

  const updateColorButtonRowsPixelRange = [
    updateColorButtonRowsStart,
    updateColorButtonRowsEnd,
  ];

  const updateColorButtonRowsIndexRange = updateColorButtonRowsPixelRange.map(
    (pixels) => sortedUniqueRowPoints.indexOf(pixels as number),
  );

  const headingRange = {
    startColumnIndex: headingColumnsIndexRange[0],
    endColumnIndex: headingColumnsIndexRange[1],
    startRowIndex: headingRowsIndexRange[0],
    endRowIndex: headingRowsIndexRange[1],
  };

  const updateColorButtonRanges = {
    name: {
      startColumnIndex: updateColorButtonColumnsIndexRange.name[0],
      endColumnIndex: updateColorButtonColumnsIndexRange.name[1],
      startRowIndex: updateColorButtonRowsIndexRange[0],
      endRowIndex: updateColorButtonRowsIndexRange[1],
    },
    value: {
      startColumnIndex: updateColorButtonColumnsIndexRange.value[0],
      endColumnIndex: updateColorButtonColumnsIndexRange.value[1],
      startRowIndex: updateColorButtonRowsIndexRange[0],
      endRowIndex: updateColorButtonRowsIndexRange[1],
    },
  };

  const generalSettingsMerges = getMergesFromElementRanges(
    generalSettingsRanges,
  );

  const weekdaysColumnsNamesMerges = getMergesFromElementRanges(
    weekdaysColumnsNamesRanges,
  );

  const weekdaysMerges: {
    startColumnIndex: number;
    endColumnIndex: number;
    startRowIndex: number;
    endRowIndex: number;
  }[] = [];

  weekdaysRanges.forEach((weekdayRanges) => {
    weekdaysMerges.push(...getMergesFromElementRanges(weekdayRanges));
  });

  const updateColorButtonMerges = getMergesFromElementRanges(
    updateColorButtonRanges,
  );

  const columnCount = sortedUniqueColumnPoints.length - 1;
  const rowCount = sortedUniqueRowPoints.length - 1;

  const columnsResizeRequests = getDimensionsResizeRequests(
    3,
    "COLUMNS",
    sortedUniqueColumnPoints,
  );

  const rowsResizeRequests = getDimensionsResizeRequests(
    3,
    "ROWS",
    sortedUniqueRowPoints,
  );

  const grid: Schema$CellData[][] = Array.from(
    { length: sortedUniqueRowPoints.length - 1 },
    (unused) =>
      Array.from({ length: sortedUniqueColumnPoints.length - 1 }, () => ({
        userEnteredFormat: {
          backgroundColorStyle: { themeColor: "BACKGROUND" },
          textFormat: {
            fontSize: 11,
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
          red: 147 / 255,
          green: 76 / 255,
          blue: 76 / 255,
        },
      },
    },
  };

  const valuesRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 125 / 255,
          green: 58 / 255,
          blue: 58 / 255,
        },
      },
    },
  };

  const weekdayRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 99 / 255,
          green: 109 / 255,
          blue: 58 / 255,
        },
      },
    },
  };

  const requiredHoursRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 52 / 255,
          green: 57 / 255,
          blue: 30 / 255,
        },
      },
    },
  };

  const border = {
    style: "SOLID",
    colorStyle: {
      rgbColor: {
        red: 197 / 255,
        green: 195 / 255,
        blue: 195 / 255,
      },
    },
  };
  const updateColorButtonRequest = {
    userEnteredFormat: {
      backgroundColorStyle: {
        rgbColor: {
          red: 239 / 255,
          green: 239 / 255,
          blue: 239 / 255,
        },
      },
      borders: {
        top: border,
        right: border,
        bottom: border,
        left: border,
      },
      textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 } },
    },
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

  const { firstRow, secondRow, thirdRow } = generalSettingsRanges;

  if ("leftFieldsNames" in firstRow) {
    updateGrid(firstRow.leftFieldsNames, {
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

  if ("rightFieldsNames" in firstRow) {
    updateGrid(firstRow.rightFieldsNames, {
      ...namesRequest,
      userEnteredValue: { formulaValue: "=Computed!$B$77" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$77',
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("leftFieldsValues" in firstRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "monthlyHourlyRate",
          name: "monthlyHourlyRate",
          range: { sheetId: 3, ...firstRow.leftFieldsValues },
        },
      },
    });
    updateGrid(firstRow.leftFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { numberValue: +hourlyRate },
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

  if ("rightFieldsValues" in firstRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "preferredLanguage",
          name: "preferredLanguage",
          range: { sheetId: 3, ...firstRow.rightFieldsValues },
        },
      },
    });
    updateGrid(firstRow.rightFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { stringValue: preferredLanguage },
      dataValidation: {
        condition: {
          type: "ONE_OF_RANGE",
          values: [
            {
              userEnteredValue: "=Localization!A1:B1",
            },
          ],
        },
        strict: true,
        showCustomUi: true,
      },
    });
  }

  if ("leftFieldsNames" in secondRow) {
    updateGrid(secondRow.leftFieldsNames, {
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

  if ("rightFieldsNames" in secondRow) {
    updateGrid(secondRow.rightFieldsNames, {
      ...namesRequest,
      userEnteredValue: { formulaValue: "=Computed!$B$71" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$71',
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("leftFieldsValues" in secondRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "monthlyOvertimeMultiplier",
          name: "monthlyOvertimeMultiplier",
          range: { sheetId: 3, ...secondRow.leftFieldsValues },
        },
      },
    });
    updateGrid(secondRow.leftFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { numberValue: +overtimeMultiplier },
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

  if ("rightFieldsValues" in secondRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "month",
          name: "month",
          range: { sheetId: 3, ...secondRow.rightFieldsValues },
        },
      },
    });
    updateGrid(secondRow.rightFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { numberValue: month + 1 },
      dataValidation: {
        condition: {
          type: "ONE_OF_LIST",
          values: [
            {
              userEnteredValue: "1",
            },
            {
              userEnteredValue: "2",
            },
            {
              userEnteredValue: "3",
            },
            {
              userEnteredValue: "4",
            },
            {
              userEnteredValue: "5",
            },
            {
              userEnteredValue: "6",
            },
            {
              userEnteredValue: "7",
            },
            {
              userEnteredValue: "8",
            },
            {
              userEnteredValue: "9",
            },
            {
              userEnteredValue: "10",
            },
            {
              userEnteredValue: "11",
            },
            {
              userEnteredValue: "12",
            },
          ],
        },
        strict: true,
        showCustomUi: true,
      },
    });
  }

  if ("leftFieldsNames" in thirdRow) {
    updateGrid(thirdRow.leftFieldsNames, {
      ...namesRequest,
      userEnteredValue: { formulaValue: "=Computed!$B$69" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$69',
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("rightFieldsNames" in thirdRow) {
    updateGrid(thirdRow.rightFieldsNames, {
      ...namesRequest,
      userEnteredValue: { formulaValue: "=Computed!$B$72" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$72',
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("leftFieldsValues" in thirdRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "displayedCurrency",
          name: "displayedCurrency",
          range: { sheetId: 3, ...thirdRow.leftFieldsValues },
        },
      },
    });
    updateGrid(thirdRow.leftFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { stringValue: displayedCurrency },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue:
                '=AND(GTE(LEN(INDIRECT("RC",FALSE)),MIN((1),(5))),LTE(LEN(INDIRECT("RC",FALSE)),MAX((1),(5))))',
            },
          ],
        },
        strict: true,
      },
    });
  }

  if ("rightFieldsValues" in thirdRow) {
    namedRangesRequests.push({
      addNamedRange: {
        namedRange: {
          namedRangeId: "year",
          name: "year",
          range: { sheetId: 3, ...thirdRow.rightFieldsValues },
        },
      },
    });
    updateGrid(thirdRow.rightFieldsValues, {
      ...valuesRequest,
      userEnteredValue: { numberValue: year },
      dataValidation: {
        condition: {
          type: "NUMBER_GREATER_THAN_EQ",
          values: [
            {
              userEnteredValue: "1800",
            },
          ],
        },
        strict: true,
      },
    });
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

  weekdaysRanges.forEach((weekdaysRange, index) => {
    const { content, wholeElement } = weekdaysRange;

    if ("startRowIndex" in wholeElement) {
      updateGrid(wholeElement, weekdayRequest);
    }

    if ("requiredHoursColumn" in content) {
      namedRangesRequests.push(
        ...[
          {
            addNamedRange: {
              namedRange: {
                namedRangeId: `weekdayRequiredHours_${`0${index}`.slice(-2)}`,
                name: `weekdayRequiredHours_${`0${index}`.slice(-2)}`,
                range: { sheetId: 3, ...content.requiredHoursColumn },
              },
            },
          },
          {
            addNamedRange: {
              namedRange: {
                namedRangeId: `weekdayDisabledDay_${`0${index}`.slice(-2)}`,
                name: `weekdayDisabledDay_${`0${index}`.slice(-2)}`,
                range: { sheetId: 3, ...content.disabledDayColumn },
              },
            },
          },
          {
            addNamedRange: {
              namedRange: {
                namedRangeId: `weekdayColor_${`0${index}`.slice(-2)}`,
                name: `weekdayColor_${`0${index}`.slice(-2)}`,
                range: { sheetId: 3, ...content.colorColumn },
              },
            },
          },
        ],
      );
      updateGrid(content.requiredHoursColumn, {
        ...requiredHoursRequest,
        userEnteredValue: { numberValue: +requiredHours[weekdays[index]] },
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
      updateGrid(content.weekdayColumn, {
        userEnteredValue: { formulaValue: `=Computed!$B$${40 + index}` },
        dataValidation: {
          condition: {
            type: "CUSTOM_FORMULA",
            values: [
              {
                userEnteredValue: `=INDIRECT("RC",FALSE)=Computed!$B$${
                  40 + index
                }`,
              },
            ],
          },
          strict: true,
        },
      });
      updateGrid(content.disabledDayColumn, {
        userEnteredValue: { boolValue: disabledDays[weekdays[index]] },
        dataValidation: {
          condition: {
            type: "BOOLEAN",
          },
          strict: true,
        },
      });
    }
    const weekdayColorHsv = weekdaysColors[weekdays[index]];

    const weekdayColorRgb = hsvToRgb(weekdayColorHsv);

    if ("colorColumn" in content) {
      updateGrid(content.colorColumn, {
        userEnteredFormat: {
          backgroundColorStyle: {
            rgbColor: {
              red: weekdayColorRgb[0],
              green: weekdayColorRgb[1],
              blue: weekdayColorRgb[2],
            },
          },
        },
      });
    }
  });

  const { name, value } = updateColorButtonRanges;

  const wholeButton = {
    startColumnIndex: name.startColumnIndex,
    endColumnIndex: value.endColumnIndex,
    startRowIndex: name.startRowIndex,
    endRowIndex: name.endRowIndex,
  };

  updateGrid(wholeButton, updateColorButtonRequest);

  updateGrid(name, {
    userEnteredValue: {
      formulaValue: `=IF(INDIRECT("R${value.startRowIndex + 1}C${
        value.startColumnIndex + 1
      }",FALSE),Computed!$B$78,Computed!$B$79)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=IF(INDIRECT("R${
              value.startRowIndex + 1
            }C${
              value.startColumnIndex + 1
            }",FALSE),Computed!$B$78,Computed!$B$79)`,
          },
        ],
      },
      strict: true,
    },
  });

  updateGrid(value, {
    dataValidation: {
      condition: {
        type: "BOOLEAN",
      },
      strict: true,
    },
  });
  namedRangesRequests.push({
    addNamedRange: {
      namedRange: {
        namedRangeId: "updateColorsCheckbox",
        name: "updateColorsCheckbox",
        range: { sheetId: 3, ...value },
      },
    },
  });

  updateGrid(headingRange, {
    userEnteredValue: {
      formulaValue: `=Computed!$B$66`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$66',
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
      verticalAlignment: "BOTTOM",
    },
  });

  if ("weekdayColumn" in weekdaysColumnsNamesRanges.content) {
    const {
      weekdayColumn,
      requiredHoursColumn,
      disabledDayColumn,
      colorColumn,
    } = weekdaysColumnsNamesRanges.content;
    updateGrid(weekdayColumn, {
      userEnteredValue: { formulaValue: "=Computed!$B$73" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$73',
            },
          ],
        },
        strict: true,
      },
    });
    updateGrid(requiredHoursColumn, {
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
    updateGrid(disabledDayColumn, {
      userEnteredValue: { formulaValue: "=Computed!$B$74" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$74',
            },
          ],
        },
        strict: true,
      },
    });
    updateGrid(colorColumn, {
      userEnteredValue: { formulaValue: "=Computed!$B$75" },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: '=INDIRECT("RC",FALSE)=Computed!$B$75',
            },
          ],
        },
        strict: true,
      },
    });
  }

  const rowData = grid.map((row) => ({ values: row }));

  const unprotectedRanges = [];

  if ("leftFieldsValues" in firstRow) {
    unprotectedRanges.push({ ...firstRow.leftFieldsValues, sheetId: 3 });
  }

  if ("rightFieldsValues" in firstRow) {
    unprotectedRanges.push({ ...firstRow.rightFieldsValues, sheetId: 3 });
  }

  if ("leftFieldsValues" in secondRow) {
    unprotectedRanges.push({ ...secondRow.leftFieldsValues, sheetId: 3 });
  }

  if ("rightFieldsValues" in secondRow) {
    unprotectedRanges.push({ ...secondRow.rightFieldsValues, sheetId: 3 });
  }

  if ("leftFieldsValues" in thirdRow) {
    unprotectedRanges.push({ ...thirdRow.leftFieldsValues, sheetId: 3 });
  }

  if ("rightFieldsValues" in thirdRow) {
    unprotectedRanges.push({ ...thirdRow.rightFieldsValues, sheetId: 3 });
  }

  for (const weekdayRanges of weekdaysRanges) {
    const { content } = weekdayRanges;
    if ("requiredHoursColumn" in content) {
      unprotectedRanges.push({ ...content.requiredHoursColumn, sheetId: 3 });
      unprotectedRanges.push({ ...content.disabledDayColumn, sheetId: 3 });
      unprotectedRanges.push({ ...content.colorColumn, sheetId: 3 });
    }
  }

  unprotectedRanges.push({ ...value, sheetId: 3 });

  const monthSettingsSheetRequests = [
    ...columnsResizeRequests,
    ...rowsResizeRequests,
    ...namedRangesRequests,
  ];

  const monthSettingsSheet: Schema$Sheet = {
    properties: {
      title: "Month Settings",
      sheetType: "GRID",
      sheetId: 3,
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
    merges: [
      ...generalSettingsMerges,
      ...weekdaysColumnsNamesMerges,
      ...weekdaysMerges,
      ...updateColorButtonMerges,
      headingRange,
    ].map((range) => ({
      ...range,
      sheetId: 3,
    })),
    protectedRanges: [{ range: { sheetId: 3 }, unprotectedRanges }],
  };

  return {
    monthSettingsSheet,
    monthSettingsSheetRequests,
    monthSettingsValuesRanges,
  };
};
