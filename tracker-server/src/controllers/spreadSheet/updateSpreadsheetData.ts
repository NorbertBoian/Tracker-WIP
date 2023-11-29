import { google } from "googleapis";
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
import { IDate } from "../../utils/getEmptyDatesArray";
import { googleAuth, Schema$GridRange, Schema$Request } from "./googleApiTypes";
import { userDefaultDaysColorsType } from "../updateUserSettings";
import { getSpreadsheetObject } from "./getSpreadsheetObject";
import { getTimesValues } from "./getTimesValues";
import { hsvToRgb } from "./hsvToRgb";
import { clearRanges } from "./clearRanges";

interface IParameters {
  auth: googleAuth;
  spreadsheetId: string;
  title: string;
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  preferredLanguage: languageCodeType;
  month: monthNumberType;
  year: number;
  requiredHours: requiredHoursType;
  disabledDays: disabledDaysType;
  weekdaysColors: Required<userDefaultDaysColorsType>;
  filteredDates: IDate[];
}

export const updateSpreadsheetData = async ({
  auth,
  spreadsheetId,
  title,
  hourlyRate,
  overtimeMultiplier,
  displayedCurrency,
  preferredLanguage,
  month,
  year,
  requiredHours,
  disabledDays,
  weekdaysColors,
  filteredDates,
}: IParameters): Promise<string> => {
  const { namedRanges, sheets } = await getSpreadsheetObject(
    auth,
    spreadsheetId,
  );
  const loneRanges: {
    monthlyHourlyRate: Schema$GridRange;
    preferredLanguage: Schema$GridRange;
    monthlyOvertimeMultiplier: Schema$GridRange;
    month: Schema$GridRange;
    displayedCurrency: Schema$GridRange;
    year: Schema$GridRange;
  } = {
    monthlyHourlyRate: undefined,
    preferredLanguage: undefined,
    monthlyOvertimeMultiplier: undefined,
    month: undefined,
    displayedCurrency: undefined,
    year: undefined,
  } as any;

  const rangesArrays: {
    began: Schema$GridRange[];
    ended: Schema$GridRange[];
    hourlyRate: Schema$GridRange[];
    overtimeMultiplier: Schema$GridRange[];
    requiredHours: Schema$GridRange[];
    isHoliday: Schema$GridRange[];
    weekdayRequiredHours: Schema$GridRange[];
    weekdayDisabledDay: Schema$GridRange[];
    weekdayColor: Schema$GridRange[];
  } = {
    began: [],
    ended: [],
    hourlyRate: [],
    overtimeMultiplier: [],
    requiredHours: [],
    isHoliday: [],
    weekdayRequiredHours: [],
    weekdayDisabledDay: [],
    weekdayColor: [],
  } as any;

  if (namedRanges)
    for (const namedRange of namedRanges) {
      if (namedRange.namedRangeId && namedRange.range) {
        const [name, index] = namedRange.namedRangeId?.split("_");
        if (Object.keys(rangesArrays).includes(name)) {
          const castedName = name as keyof typeof rangesArrays;
          rangesArrays[castedName][+index] = namedRange.range;
        } else if (Object.keys(loneRanges).includes(name)) {
          const castedName = name as keyof typeof loneRanges;
          loneRanges[castedName] = namedRange.range;
        }
      }
    }

  const monthSettingsValueRangePairs = [
    {
      range: loneRanges.monthlyHourlyRate,
      value: {
        numberValue: +hourlyRate,
      },
    },
    {
      range: loneRanges.monthlyOvertimeMultiplier,
      value: {
        numberValue: +overtimeMultiplier,
      },
    },
    {
      range: loneRanges.displayedCurrency,
      value: { stringValue: displayedCurrency },
    },
    {
      range: loneRanges.preferredLanguage,
      value: { stringValue: preferredLanguage },
    },
    { range: loneRanges.month, value: { numberValue: month + 1 } },
    { range: loneRanges.year, value: { numberValue: year } },
  ];

  const updateMonthSettingsValuesRequests: Schema$Request[] = [];

  for (const monthSettingsValueRangePair of monthSettingsValueRangePairs) {
    updateMonthSettingsValuesRequests.push({
      updateCells: {
        rows: [
          { values: [{ userEnteredValue: monthSettingsValueRangePair.value }] },
        ],
        fields: "userEnteredValue",
        range: monthSettingsValueRangePair.range,
      },
    });
  }

  const updateWeekdaySettingsValuesRequests: Schema$Request[] = [];

  const weekdays = [
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
    sunday,
  ];

  weekdays.forEach((weekday, index) => {
    updateWeekdaySettingsValuesRequests.push(
      ...[
        {
          updateCells: {
            rows: [
              {
                values: [
                  { userEnteredValue: { boolValue: disabledDays[weekday] } },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays.weekdayDisabledDay[index],
          },
        },
        {
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredValue: { numberValue: +requiredHours[weekday] },
                  },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays.weekdayRequiredHours[index],
          },
        },
      ],
    );
  });

  const updateDaysValuesRequests: Schema$Request[] = [];

  const clearRequestRanges: string[] = [];
  filteredDates.forEach((day, index) => {
    const [beganTime, endedTime] = getTimesValues(day);
    const daySettingsRequests: Schema$Request[] = [];

    const daySettingsKeys = [
      "hourlyRate",
      "overtimeMultiplier",
      "requiredHours",
    ] as const;

    daySettingsKeys.forEach((daySettingKey) => {
      if (day[daySettingKey])
        daySettingsRequests.push({
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredValue: {
                      numberValue: +day[daySettingKey],
                    },
                  },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays[daySettingKey][index],
          },
        });
      else {
        const { startRowIndex, startColumnIndex } =
          rangesArrays[daySettingKey][index];
        if (
          startRowIndex !== null &&
          startRowIndex !== undefined &&
          startColumnIndex !== null &&
          startColumnIndex !== undefined
        )
          clearRequestRanges.push(
            `'Days settings'!R${startRowIndex + 1}C${startColumnIndex + 1}`,
          );
      }
    });

    updateDaysValuesRequests.push(
      ...[
        {
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredValue: beganTime,
                  },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays.began[index],
          },
        },
        {
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredValue: endedTime,
                  },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays.ended[index],
          },
        },
        ...daySettingsRequests,
        {
          updateCells: {
            rows: [
              {
                values: [
                  {
                    userEnteredValue: { boolValue: day.isHoliday },
                  },
                ],
              },
            ],
            fields: "userEnteredValue",
            range: rangesArrays.isHoliday[index],
          },
        },
      ],
    );
  });

  const updateWeekdaysNamesColorsColumnInMonthSettingsRequests: Schema$Request[] =
    [];

  weekdays.forEach((weekday, index) => {
    const weekdayColorHsv = weekdaysColors[weekday];
    const weekdayColorRgb = hsvToRgb(weekdayColorHsv);
    updateWeekdaysNamesColorsColumnInMonthSettingsRequests.push({
      updateCells: {
        rows: [
          {
            values: [
              {
                userEnteredFormat: {
                  backgroundColorStyle: {
                    rgbColor: {
                      red: weekdayColorRgb[0],
                      green: weekdayColorRgb[1],
                      blue: weekdayColorRgb[2],
                    },
                  },
                },
              },
            ],
          },
        ],
        fields: "userEnteredFormat.backgroundColorStyle",
        range: rangesArrays.weekdayColor[index],
      },
    });
  });

  const updateConditionalRulesRequests: Schema$Request[] = [];

  if (sheets) {
    const inputSheet = sheets[0];
    const inputRules = inputSheet.conditionalFormats ?? [];
    const inputDayColorRulesIndexes: number[] = [];
    inputRules.forEach((inputRule, index) => {
      if (inputRule.ranges && inputRule.ranges.length === 31)
        inputDayColorRulesIndexes.push(index);
    });
    inputDayColorRulesIndexes.forEach((inputDayColorRulesIndex) => {
      const oneBasedIndexOfDay =
        inputRules[
          inputDayColorRulesIndex
        ].booleanRule?.condition?.values?.[0]?.userEnteredValue?.slice(-1);
      if (oneBasedIndexOfDay && !isNaN(+oneBasedIndexOfDay)) {
        const [red, green, blue] = hsvToRgb(
          weekdaysColors[weekdays[+oneBasedIndexOfDay - 1]],
        );
        updateConditionalRulesRequests.push({
          updateConditionalFormatRule: {
            index: inputDayColorRulesIndex,
            sheetId: 0,
            rule: {
              ranges: inputRules[inputDayColorRulesIndex].ranges,
              booleanRule: {
                condition:
                  inputRules[inputDayColorRulesIndex].booleanRule?.condition,
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
            },
          },
        });
      }
    });

    const statsSheet = sheets[1];
    const statsRules = statsSheet.conditionalFormats ?? [];
    const statsDayColorRulesIndexes: number[] = [];
    statsRules.forEach((statsRule, index) => {
      if (statsRule.ranges && statsRule.ranges.length === 31)
        statsDayColorRulesIndexes.push(index);
    });
    statsDayColorRulesIndexes.forEach((statsDayColorRulesIndex) => {
      const oneBasedIndexOfDay =
        statsRules[
          statsDayColorRulesIndex
        ].booleanRule?.condition?.values?.[0]?.userEnteredValue?.slice(-1);
      if (oneBasedIndexOfDay && !isNaN(+oneBasedIndexOfDay)) {
        const [red, green, blue] = hsvToRgb(
          weekdaysColors[weekdays[+oneBasedIndexOfDay - 1]],
        );
        updateConditionalRulesRequests.push({
          updateConditionalFormatRule: {
            index: statsDayColorRulesIndex,
            sheetId: 1,
            rule: {
              ranges: statsRules[statsDayColorRulesIndex].ranges,
              booleanRule: {
                condition:
                  statsRules[statsDayColorRulesIndex].booleanRule?.condition,
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
            },
          },
        });
      }
    });
  }

  const updateRequests = [
    ...updateMonthSettingsValuesRequests,
    ...updateWeekdaySettingsValuesRequests,
    ...updateDaysValuesRequests,
    ...updateWeekdaysNamesColorsColumnInMonthSettingsRequests,
    ...updateConditionalRulesRequests,
    {
      updateSpreadsheetProperties: { properties: { title }, fields: "title" },
    },
  ];

  return new Promise(async (resolve, reject) => {
    const sheets = google.sheets("v4");
    await clearRanges(auth, spreadsheetId, clearRequestRanges);
    sheets.spreadsheets.batchUpdate(
      {
        auth,
        spreadsheetId,
        requestBody: { requests: updateRequests },
      },
      (err: Error | null) => {
        if (err) reject(err);
        resolve("Success");
      },
    );
  });
};
