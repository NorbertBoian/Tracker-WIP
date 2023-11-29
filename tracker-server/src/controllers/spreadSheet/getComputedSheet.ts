import { Schema$CellData, Schema$Sheet } from "./googleApiTypes";

export const getComputedSheet = (
  daysInputValuesRanges: {
    began: [number, number];
    ended: [number, number];
  }[],
  daysSettingsValuesRanges: {
    hourlyRate: [number, number];
    overtimeMultiplier: [number, number];
    requiredHours: [number, number];
    isHoliday: [number, number];
  }[],
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
) => {
  const firstColumnEnd = Array.from({ length: 30 }, (unused, index) => {
    return `=IF(MONTH($A${index + 2}+1)<>MONTH($N$18),FALSE,$A${index + 2}+1)`;
  });
  const firstColumn = [
    "All days in month",
    "=IF(MONTH($N$21+1)<>MONTH($N$18),FALSE,$N$21+1)",
    ...firstColumnEnd,
  ];

  const secondColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($L${index + 2}=TRUE,FALSE,$A${index + 2})`;
  });
  const secondColumn = ["Active days", ...secondColumnEnd];

  const fourthColumn = [
    "Filtered Active Days Google Sheets",
    "=iferror(FILTER($B$2:$B$32, $B$2:$B$32 <> FALSE),FALSE)",
  ];

  const fifthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IFERROR(AGGREGATE(15,6,$B$2:$B$32/($B$2:$B$32<>FALSE),ROW(${
      index + 1
    }:${index + 1})),FALSE)`;
  });
  const fifthColumn = ["Filtered Active Days Excel", ...fifthColumnEnd];

  const sixthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF(IF($N$24,$E${index + 2},$D${index + 2}),IF($N$24,$E${
      index + 2
    },$D${index + 2}),FALSE)`;
  });
  const sixthColumn = ["Filtered Active Days", ...sixthColumnEnd];

  const seventhColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${index + 2},SWITCH(WEEKDAY($F${
      index + 2
    },2), 1, $B$40, 2, $B$41, 3, $B$42, 4, $B$43, 5, $B$44, 6, $B$45, 7,$B$46),FALSE)`;
  });
  const seventhColumn = ["Filtered Days Weekdays", ...seventhColumnEnd];

  const hourlyRates = daysSettingsValuesRanges.map(
    (day) =>
      `INDIRECT("'Days Settings'!R${day.hourlyRate[0] + 1}C${
        day.hourlyRate[1] + 1
      }",FALSE)`,
  );
  const overtimeMultipliers = daysSettingsValuesRanges.map(
    (day) =>
      `INDIRECT("'Days Settings'!R${day.overtimeMultiplier[0] + 1}C${
        day.overtimeMultiplier[1] + 1
      }",FALSE)`,
  );
  const requiredHours = daysSettingsValuesRanges.map(
    (day) =>
      `INDIRECT("'Days Settings'!R${day.requiredHours[0] + 1}C${
        day.requiredHours[1] + 1
      }",FALSE)`,
  );
  const holidayStatuses = daysSettingsValuesRanges.map(
    (day) =>
      `INDIRECT("'Days Settings'!R${day.isHoliday[0] + 1}C${
        day.isHoliday[1] + 1
      }",FALSE)`,
  );

  const eighthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${index + 2},${holidayStatuses[index]},FALSE)`;
  });
  const eighthColumn = ["Holiday", ...eighthColumnEnd];

  const ninethColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=WEEKDAY(A${index + 2},3)`;
  });
  const ninethColumn = ["Weekday", ...ninethColumnEnd];

  const tenthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=ADDRESS(I${index + 2}+8,15)`;
  });
  const tenthColumn = ["Address String", ...tenthColumnEnd];

  const eleventhColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=INDIRECT($K${index + 2})`;
  });
  const eleventhColumn = ["Weekday Disabled", ...eleventhColumnEnd];

  const columnCount = 15;
  const rowCount = 79;

  const grid: Schema$CellData[][] = Array.from({ length: rowCount }, (unused) =>
    Array.from({ length: columnCount }, () => ({
      userEnteredFormat: {
        textFormat: {
          foregroundColor: { red: 0, green: 0, blue: 0 } as const,
        },
        horizontalAlignment: "CENTER",
        verticalAlignment: "MIDDLE",
      },
    })),
  );

  const firstPart = [
    firstColumn,
    secondColumn,
    [],
    fourthColumn,
    fifthColumn,
    sixthColumn,
    seventhColumn,
    eighthColumn,
    ninethColumn,
    [],
    tenthColumn,
    eleventhColumn,
  ];

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

  firstPart.forEach((column, columnIndex) => {
    column.forEach((value, rowIndex) => {
      grid[rowIndex][columnIndex] = mergeRequests(grid[rowIndex][columnIndex], {
        userEnteredValue:
          value[0] === "=" ? { formulaValue: value } : { stringValue: value },
        dataValidation: {
          condition:
            value[0] === "="
              ? {
                  type: "CUSTOM_FORMULA",
                  values: [
                    {
                      userEnteredValue: `=INDIRECT("RC",FALSE)${value}`,
                    },
                  ],
                }
              : {
                  type: "TEXT_EQ",
                  values: [
                    {
                      userEnteredValue: value,
                    },
                  ],
                },
          strict: true,
        },
      });
    });
  });

  const weekdays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  grid[6][13] = mergeRequests(grid[6][13], {
    userEnteredValue: { stringValue: "Weekdays" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Weekdays",
          },
        ],
      },
      strict: true,
    },
  });
  grid[6][14] = mergeRequests(grid[6][14], {
    userEnteredValue: { stringValue: "Disabled" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Disabled",
          },
        ],
      },
      strict: true,
    },
  });
  grid[33][5] = mergeRequests(grid[33][5], {
    userEnteredValue: { stringValue: "Weekdays" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Weekdays",
          },
        ],
      },
      strict: true,
    },
  });
  grid[34][5] = mergeRequests(grid[34][5], {
    userEnteredValue: { stringValue: "Required Hours" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Required Hours",
          },
        ],
      },
      strict: true,
    },
  });
  weekdays.forEach((weekday, index) => {
    grid[7 + index][13] = mergeRequests(grid[7 + index][13], {
      userEnteredValue: { stringValue: weekday },
      dataValidation: {
        condition: {
          type: "TEXT_EQ",
          values: [
            {
              userEnteredValue: weekday,
            },
          ],
        },
        strict: true,
      },
    });
    grid[33][6 + index] = mergeRequests(grid[33][6 + index], {
      userEnteredValue: { stringValue: weekday },
      dataValidation: {
        condition: {
          type: "TEXT_EQ",
          values: [
            {
              userEnteredValue: weekday,
            },
          ],
        },
        strict: true,
      },
    });
    grid[7 + index][14] = mergeRequests(grid[7 + index][14], {
      userEnteredValue: {
        formulaValue: `=INDIRECT("'Month Settings'!R${
          monthSettingsValuesRanges.weekdays[index].disabledDay[0] + 1
        }C${
          monthSettingsValuesRanges.weekdays[index].disabledDay[1] + 1
        }",FALSE)`,
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=INDIRECT("RC",FALSE)=INDIRECT("'Month Settings'!R${
                monthSettingsValuesRanges.weekdays[index].disabledDay[0] + 1
              }C${
                monthSettingsValuesRanges.weekdays[index].disabledDay[1] + 1
              }",FALSE)`,
            },
          ],
        },
        strict: true,
      },
    });
    grid[34][6 + index] = mergeRequests(grid[34][6 + index], {
      userEnteredValue: {
        formulaValue: `=INDIRECT("'Month Settings'!R${
          monthSettingsValuesRanges.weekdays[index].requiredHours[0] + 1
        }C${
          monthSettingsValuesRanges.weekdays[index].requiredHours[1] + 1
        }",FALSE)`,
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=INDIRECT("RC",FALSE)=INDIRECT("'Month Settings'!R${
                monthSettingsValuesRanges.weekdays[index].requiredHours[0] + 1
              }C${
                monthSettingsValuesRanges.weekdays[index].requiredHours[1] + 1
              }",FALSE)`,
            },
          ],
        },
        strict: true,
      },
    });
  });

  grid[3][13] = mergeRequests(grid[3][13], {
    userEnteredValue: { stringValue: "Month name" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Month name",
          },
        ],
      },
      strict: true,
    },
  });
  grid[4][13] = mergeRequests(grid[4][13], {
    userEnteredValue: {
      formulaValue:
        "=SWITCH(MONTH($N$18), 1, $B$47, 2, $B$48, 3, $B$49, 4, $B$50, 5, $B$51, 6, $B$52, 7, $B$53,8, $B$54, 9, $B$55, 10, $B$56, 11, $B$57, 12, $B$58)",
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=SWITCH(MONTH($N$18), 1, $B$47, 2, $B$48, 3, $B$49, 4, $B$50, 5, $B$51, 6, $B$52, 7, $B$53,8, $B$54, 9, $B$55, 10, $B$56, 11, $B$57, 12, $B$58)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[16][13] = mergeRequests(grid[16][13], {
    userEnteredValue: { stringValue: "First day of month" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "First day of month",
          },
        ],
      },
      strict: true,
    },
  });
  grid[17][13] = mergeRequests(grid[17][13], {
    userEnteredValue: {
      formulaValue: `=DATE(INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.year[0] + 1
      }C${
        monthSettingsValuesRanges.general.year[1] + 1
      }",FALSE),INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.month[0] + 1
      }C${monthSettingsValuesRanges.general.month[1] + 1}",FALSE),1)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=DATE(INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.year[0] + 1
            }C${
              monthSettingsValuesRanges.general.year[1] + 1
            }",FALSE),INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.month[0] + 1
            }C${monthSettingsValuesRanges.general.month[1] + 1}",FALSE),1)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[19][13] = mergeRequests(grid[19][13], {
    userEnteredValue: { stringValue: "Last day of previous month" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Last day of previous month",
          },
        ],
      },
      strict: true,
    },
  });
  grid[20][13] = mergeRequests(grid[20][13], {
    userEnteredValue: {
      formulaValue: "=$N$18-1",
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=$N$18-1`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[22][13] = mergeRequests(grid[22][13], {
    userEnteredValue: { stringValue: "Aggregate function available" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Aggregate function available",
          },
        ],
      },
      strict: true,
    },
  });
  grid[23][13] = mergeRequests(grid[23][13], {
    userEnteredValue: {
      formulaValue: "=IFERROR(AGGREGATE(5,4,$N$26)>0,FALSE)",
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=IFERROR(AGGREGATE(5,4,$N$26)>0,FALSE)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[33][0] = mergeRequests(grid[33][0], {
    userEnteredValue: { stringValue: "Total hours worked" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Total hours worked",
          },
        ],
      },
      strict: true,
    },
  });
  grid[34][0] = mergeRequests(grid[34][0], {
    userEnteredValue: {
      formulaValue: "=SUM($G$40:$G$70)",
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=SUM($G$40:$G$70)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[33][1] = mergeRequests(grid[33][1], {
    userEnteredValue: { stringValue: "Total salary" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Total salary",
          },
        ],
      },
      strict: true,
    },
  });
  grid[34][1] = mergeRequests(grid[34][1], {
    userEnteredValue: {
      formulaValue: "=SUM($M$40:$M$70)",
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=SUM($M$40:$M$70)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[36][0] = mergeRequests(grid[36][0], {
    userEnteredValue: { stringValue: "Column of selected language" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Column of selected language",
          },
        ],
      },
      strict: true,
    },
  });
  grid[36][1] = mergeRequests(grid[36][1], {
    userEnteredValue: {
      formulaValue: `=MATCH(INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.languageCode[0] + 1
      }C${
        monthSettingsValuesRanges.general.languageCode[1] + 1
      }",FALSE), Localization!$A$1:$B$1,0)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=MATCH(INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.languageCode[0] + 1
            }C${
              monthSettingsValuesRanges.general.languageCode[1] + 1
            }",FALSE), Localization!$A$1:$B$1,0)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[35][3] = mergeRequests(grid[35][3], {
    userEnteredValue: { stringValue: "Hourly Rate" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Hourly Rate",
          },
        ],
      },
      strict: true,
    },
  });
  grid[35][4] = mergeRequests(grid[35][4], {
    userEnteredValue: {
      formulaValue: `=INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.hourlyRate[0] + 1
      }C${monthSettingsValuesRanges.general.hourlyRate[1] + 1}",FALSE)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.hourlyRate[0] + 1
            }C${monthSettingsValuesRanges.general.hourlyRate[1] + 1}",FALSE)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[36][3] = mergeRequests(grid[36][3], {
    userEnteredValue: { stringValue: "Overtime Multiplier" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Overtime Multiplier",
          },
        ],
      },
      strict: true,
    },
  });
  grid[36][4] = mergeRequests(grid[36][4], {
    userEnteredValue: {
      formulaValue: `=INDIRECT("'Month Settings'!R${
        monthSettingsValuesRanges.general.overtimeMultiplier[0] + 1
      }C${monthSettingsValuesRanges.general.overtimeMultiplier[1] + 1}",FALSE)`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=INDIRECT("'Month Settings'!R${
              monthSettingsValuesRanges.general.overtimeMultiplier[0] + 1
            }C${
              monthSettingsValuesRanges.general.overtimeMultiplier[1] + 1
            }",FALSE)`,
          },
        ],
      },
      strict: true,
    },
  });

  grid[38][0] = mergeRequests(grid[38][0], {
    userEnteredValue: { stringValue: "Localization" },
    dataValidation: {
      condition: {
        type: "TEXT_EQ",
        values: [
          {
            userEnteredValue: "Localization",
          },
        ],
      },
      strict: true,
    },
  });

  grid[38][1] = mergeRequests(grid[38][1], {
    userEnteredValue: {
      formulaValue: `=CELL("contents",INDIRECT(ADDRESS(ROW(1:1),$B$37,,,"Localization")))`,
    },
    dataValidation: {
      condition: {
        type: "CUSTOM_FORMULA",
        values: [
          {
            userEnteredValue: `=INDIRECT("RC",FALSE)=CELL("contents",INDIRECT(ADDRESS(ROW(1:1),$B$37,,,"Localization")))`,
          },
        ],
      },
      strict: true,
    },
  });

  for (let row = 0; row < 40; row++) {
    grid[row + 39][0] = mergeRequests(grid[row + 39][0], {
      userEnteredValue: { formulaValue: `=Localization!$A${row + 2}` },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=INDIRECT("RC",FALSE)=Localization!$A${
                row + 2
              }`,
            },
          ],
        },
        strict: true,
      },
    });
    grid[row + 39][1] = mergeRequests(grid[row + 39][1], {
      userEnteredValue: {
        formulaValue: `=CELL("contents",INDIRECT(ADDRESS(ROW(${row + 2}:${
          row + 2
        }),$B$37,,,"Localization")))`,
      },
      dataValidation: {
        condition: {
          type: "CUSTOM_FORMULA",
          values: [
            {
              userEnteredValue: `=INDIRECT("RC",FALSE)=CELL("contents",INDIRECT(ADDRESS(ROW(${
                row + 2
              }:${row + 2}),$B$37,,,"Localization")))`,
            },
          ],
        },
        strict: true,
      },
    });
  }

  const sFourthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=ADDRESS(35,7+$E${40 + index})`;
  });
  const sFourthColumn = [
    "Address of weekday required hours",
    ...sFourthColumnEnd,
  ];

  const sFifthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=WEEKDAY($F${40 + index},3)`;
  });
  const sFifthColumn = ["Weekday of Active Day", ...sFifthColumnEnd];

  const sSixthColumn = Array.from({ length: 32 }, (unused, index) => {
    return `=$F${index + 1}`;
  });

  const sSeventhColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${index + 40},MAX(INDIRECT("Input!R${
      daysInputValuesRanges[index].ended[0] + 1
    }C${daysInputValuesRanges[index].ended[1] + 1}",FALSE)-INDIRECT("Input!R${
      daysInputValuesRanges[index].began[0] + 1
    }C${daysInputValuesRanges[index].began[1] + 1}",FALSE),0),0)`;
  });

  const sSeventhColumn = ["Hours Worked", ...sSeventhColumnEnd];

  const sEighthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${40 + index},IF(NOT(ISBLANK(${requiredHours[index]})),${
      requiredHours[index]
    },INDIRECT($D${40 + index})),0)`;
  });
  const sEighthColumn = ["Hours Required", ...sEighthColumnEnd];

  const sNinethColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${index + 40},IF(NOT(ISBLANK(${hourlyRates[index]})),${
      hourlyRates[index]
    },$E$36),0)`;
  });
  const sNinethColumn = ["Hourly rate", ...sNinethColumnEnd];

  const sTenthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=IF($F${index + 40},IF(NOT(ISBLANK(${
      overtimeMultipliers[index]
    })),${overtimeMultipliers[index]},$E$37),0)`;
  });
  const sTenthColumn = ["Overtime multiplier", ...sTenthColumnEnd];

  const sEleventhColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=MIN($G${index + 40}*24,$H${index + 40})*MAX($I${index + 40},0)`;
  });
  const sEleventhColumn = ["Regular Pay", ...sEleventhColumnEnd];

  const sTwelfthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=MAX($G${index + 40}*24-$H${index + 40},0)*MAX($I${index + 40}*$J${
      index + 40
    },0)`;
  });
  const sTwelfthColumn = ["Overtime Pay", ...sTwelfthColumnEnd];

  const sThirteenthColumnEnd = Array.from({ length: 31 }, (unused, index) => {
    return `=SUM($K${index + 40}:$L${index + 40})`;
  });
  const sThirteenthColumn = ["Total Pay", ...sThirteenthColumnEnd];

  const secondPart = [
    sFourthColumn,
    sFifthColumn,
    sSixthColumn,
    sSeventhColumn,
    sEighthColumn,
    sNinethColumn,
    sTenthColumn,
    sEleventhColumn,
    sTwelfthColumn,
    sThirteenthColumn,
  ];

  secondPart.forEach((column, columnIndex) => {
    column.forEach((value, rowIndex) => {
      grid[rowIndex + 38][columnIndex + 3] = mergeRequests(
        grid[rowIndex + 38][columnIndex + 3],
        {
          userEnteredValue:
            value[0] === "=" ? { formulaValue: value } : { stringValue: value },
          dataValidation: {
            condition:
              value[0] === "="
                ? {
                    type: "CUSTOM_FORMULA",
                    values: [
                      {
                        userEnteredValue: `=INDIRECT("RC",FALSE)${value}`,
                      },
                    ],
                  }
                : {
                    type: "TEXT_EQ",
                    values: [
                      {
                        userEnteredValue: value,
                      },
                    ],
                  },
            strict: true,
          },
        },
      );
    });
  });

  for (let row = 1; row < 32; row++)
    for (let column = 0; column < 6; column++) {
      grid[row][column] = mergeRequests(grid[row][column], {
        userEnteredFormat: {
          numberFormat: { type: "DATE", pattern: "d mmmm yyyy" },
        },
      });
    }

  grid[17][13] = mergeRequests(grid[17][13], {
    userEnteredFormat: {
      numberFormat: { type: "DATE", pattern: "d mmmm yyyy" },
    },
  });
  grid[20][13] = mergeRequests(grid[20][13], {
    userEnteredFormat: {
      numberFormat: { type: "DATE", pattern: "d mmmm yyyy" },
    },
  });

  grid[34][0] = mergeRequests(grid[34][0], {
    userEnteredFormat: {
      numberFormat: { type: "TIME", pattern: "[hh]:mm" },
    },
  });

  for (let row = 0; row < 31; row++) {
    grid[row + 39][6] = mergeRequests(grid[row + 39][6], {
      userEnteredFormat: {
        numberFormat: { type: "TIME", pattern: "[hh]:mm" },
      },
    });
  }

  for (let row = 0; row < 31; row++) {
    for (let column = 10; column < 13; column++) {
      grid[row + 39][column] = mergeRequests(grid[row + 39][column], {
        userEnteredFormat: {
          numberFormat: { type: "NUMBER" },
        },
      });
    }
  }

  const rowData = grid.map((row) => ({ values: row }));

  const computedSheetRequests = [
    {
      autoResizeDimensions: {
        dimensions: {
          sheetId: 4,
          dimension: "COLUMNS",
          startIndex: 0,
          endIndex: columnCount,
        },
      },
    },
    {
      updateDimensionProperties: {
        properties: { pixelSize: 96 },
        fields: "pixelSize",
        range: {
          sheetId: 4,
          dimension: "COLUMNS",
          startIndex: 2,
          endIndex: 3,
        },
      },
    },
  ];

  const computedSheet: Schema$Sheet = {
    properties: {
      title: "Computed",
      sheetType: "GRID",
      sheetId: 4,
      gridProperties: {
        columnCount,
        hideGridlines: false,
        rowCount,
      },
      hidden: true,
    },
    data: [
      {
        startRow: 0,
        startColumn: 0,
        rowData,
      },
    ],
    protectedRanges: [{ range: { sheetId: 4 } }],
  };

  return {
    computedSheet,
    computedSheetRequests,
  };
};
