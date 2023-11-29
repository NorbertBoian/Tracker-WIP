import { GaxiosResponse } from "gaxios";
import { google } from "googleapis";
import { languageCodeType, monthNumberType } from "../../constants";
import { disabledDaysType, requiredHoursType } from "../../types/knex";
import { IDate } from "../../utils/getEmptyDatesArray";
import { userDefaultDaysColorsType } from "../updateUserSettings";
import { themeColors } from "./constants";
import { getComputedSheet } from "./getComputedSheet";
import { getDaysContainerWhitespace } from "./getDaysContainerWhitespace";
import { getDaysSettingsSheet } from "./getDaysSettingsSheet";
import { getInputSheet } from "./getInputSheet";
import { getLocalizationSheet } from "./getLocalizationSheet";
import { getMonthlyStatsPoints } from "./getMonthlyStatsPoints";
import { getMonthSettingsSheet } from "./getMonthSettingsSheet";
import { getStatsSheet } from "./getStatsSheet";
import {
  googleAuth,
  Schema$Request,
  Schema$Spreadsheet,
} from "./googleApiTypes";

export const createSheet = (
  fileName: string,
  auth: googleAuth,
  hourlyRate: string,
  overtimeMultiplier: string,
  displayedCurrency: string,
  preferredLanguage: languageCodeType,
  month: monthNumberType,
  year: number,
  requiredHours: requiredHoursType,
  disabledDays: disabledDaysType,
  weekdaysColors: Required<userDefaultDaysColorsType>,
  filteredDates: IDate[],
) =>
  new Promise<{
    sheetId: string;
    initialUpdatesRequests: Schema$Request[];
    rangesToBeCleared: string[];
  }>((resolve, reject) => {
    const viewportWidth = 1805;
    const inputTopMargin = 20;
    const inputBottomMargin = 80;
    const monthBottomMargin = 60;
    const monthlyStats = {
      width: 380,
      height: 75,
      gridColumns: 1 / 2,
      gap: 7,
      padding: 7,
    };
    const day = {
      width: 210,
      height: 145,
      padding: 7,
      weekdayRowHeight: 25,
      holidayRowHeight: 15,
      dateRowHeight: 20,
      fieldTopMargin: 10,
      fieldHeight: 25,
    };
    const daysContainer = {
      topMargin: 30,
      minInlineMargin: 35,
      minHorizontalGridGap: 35,
      verticalGridGap: 35,
    };

    const dayStatsGridColumns = 1 / 3;

    const generalSettings = {
      width: 500,
      gridColumns: 6 / 5,
      fieldGridColumns: 3 / 1,
      fieldHeight: 35,
      inlineGap: 35,
      blockGap: 20,
      padding: 20,
    };
    const weekday = {
      width: 500,
      height: 35,
      padding: 5,
      gap: 12,
      weekdayColumnWidthAddend: 35 / 100,
      requiredHoursColumnWidthAddend: 25 / 100,
      disabledDayColumnWidthAddend: 20 / 100,
      colorColumnWidthAddend: 20 / 100,
    };
    const weekdaysContainer = {
      blockMargin: 20,
      gap: 20,
    };
    const weekdaysColumnsNamesHeight = 30;

    const updateColorButton = {
      width: 150,
      height: 30,
      buttonWidth: 35,
    };

    const monthsSettingsHeadingHeight = 60;

    const daysContainerWhitespace = getDaysContainerWhitespace(
      daysContainer,
      viewportWidth,
      day,
    );

    const { topOffset, ...monthlyStatsDimensions } = getMonthlyStatsPoints(
      monthlyStats,
      inputTopMargin,
    );

    const {
      monthSettingsSheet,
      monthSettingsSheetRequests,
      monthSettingsValuesRanges,
    } = getMonthSettingsSheet(
      monthsSettingsHeadingHeight,
      generalSettings,
      weekday,
      weekdaysContainer,
      weekdaysColumnsNamesHeight,
      viewportWidth,
      updateColorButton,
      monthBottomMargin,
      hourlyRate,
      overtimeMultiplier,
      displayedCurrency,
      preferredLanguage,
      month,
      year,
      requiredHours,
      disabledDays,
      weekdaysColors,
    );

    const { inputSheet, inputSheetRequests, daysInputValuesRanges } =
      getInputSheet(
        topOffset,
        monthlyStatsDimensions,
        daysContainerWhitespace,
        monthSettingsValuesRanges,
        filteredDates,
        weekdaysColors,
        viewportWidth,
        inputTopMargin,
        inputBottomMargin,
        monthlyStats,
        day,
        daysContainer,
      );

    const { statsSheet, statsSheetRequests } = getStatsSheet(
      topOffset,
      monthlyStatsDimensions,
      daysContainerWhitespace,
      weekdaysColors,
      monthSettingsValuesRanges,
      viewportWidth,
      inputTopMargin,
      inputBottomMargin,
      monthlyStats,
      { ...day, gridColumns: dayStatsGridColumns },
      daysContainer,
    );

    const headingRowsPixelRangeEnd =
      inputTopMargin + monthlyStats.height + daysContainer.topMargin;

    const daySettings = {
      width: day.width,
      height: day.height,
      padding: 4,
      gridColumns: 2 / 1,
      weekdayRowHeight: 20,
      dateRowHeight: 20,
      gap: 3,
    };

    const daysSettingsContainer = {
      topMargin: headingRowsPixelRangeEnd,
      verticalGridGap: daysContainer.verticalGridGap,
      bottomMargin: inputBottomMargin,
    };

    const {
      daysSettingsSheet,
      daysSettingsSheetRequests,
      daysSettingsValuesRanges,
      rangesToBeCleared,
    } = getDaysSettingsSheet(
      daysContainerWhitespace,
      filteredDates,
      viewportWidth,
      daySettings,
      daysSettingsContainer,
    );

    const { localizationSheet, localizationSheetRequests } =
      getLocalizationSheet();

    const { computedSheet, computedSheetRequests } = getComputedSheet(
      daysInputValuesRanges,
      daysSettingsValuesRanges,
      monthSettingsValuesRanges,
    );

    const sheets = google.sheets("v4");

    sheets.spreadsheets.create(
      {
        auth,
        requestBody: {
          properties: {
            title: fileName,
            spreadsheetTheme: {
              primaryFontFamily: "Source Sans Pro",
              themeColors,
            },
          },
          sheets: [
            inputSheet,
            statsSheet,
            daysSettingsSheet,
            monthSettingsSheet,
            computedSheet,
            localizationSheet,
          ],
        },
      },
      (
        err: Error | null,
        googleres: GaxiosResponse<Schema$Spreadsheet> | null | undefined,
      ) => {
        if (
          err ||
          !googleres ||
          !googleres.data.spreadsheetId ||
          !googleres.data.sheets ||
          !googleres.data.sheets.length ||
          !googleres.data.sheets[0].properties ||
          !("sheetId" in googleres.data.sheets[0].properties)
        )
          reject(err);
        else {
          resolve({
            sheetId: googleres.data.spreadsheetId,
            initialUpdatesRequests: [
              ...inputSheetRequests,
              ...statsSheetRequests,
              ...daysSettingsSheetRequests,
              ...monthSettingsSheetRequests,
              ...computedSheetRequests,
              ...localizationSheetRequests,
            ],
            rangesToBeCleared,
          });
        }
      },
    );
  });
