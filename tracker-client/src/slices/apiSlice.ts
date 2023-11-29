import { createApi } from "@reduxjs/toolkit/query/react";
import { transformCustomMonthSettingsResponse } from "../utils/transformCustomMonthSettings";
import { transformDatesResponse } from "../utils/transformDatesResponse";
import { transformUserSettingsResponse } from "../utils/transformUserSettings";
import {
  getDatesResultType,
  getSpreadsheetQueryArg,
  logInUserQueryArg,
  logInUserResultType,
  monthCustomSettingsType,
  monthDefaultSettingsType,
  updateCustomMonthSettingsQueryArg,
  updateDatePropertyQueryArg,
  updateDatesQueryArg,
  updateInputDisabledQueryArg,
  updatePreferredLanguageQueryArg,
  userSettingsType,
  userSettingsUntransformedType,
  yearAndMonth,
} from "./apiSliceTypes";
import { customBaseQuery } from "./customBaseQuery";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: customBaseQuery,
  tagTypes: ["UserSettings", "MonthSettings", "Dates"],
  endpoints: (builder) => ({
    getDates: builder.query<getDatesResultType, yearAndMonth>({
      query: ({ month, year }) => ({
        url: "/getdates",
        method: "post",
        body: { month, year },
      }),
      providesTags: ["Dates"],
      transformResponse: transformDatesResponse,
    }),
    getUserSettings: builder.query<userSettingsType, unknown>({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      query: (email) => ({
        url: "/getusersettings",
        method: "post",
      }),
      providesTags: ["UserSettings"],
      transformResponse: transformUserSettingsResponse,
    }),
    getCustomMonthSettings: builder.query<
      monthCustomSettingsType,
      yearAndMonth
    >({
      query: ({ month, year }) => ({
        url: "/getcustommonthsettings",
        method: "post",
        body: { month, year },
      }),
      providesTags: ["MonthSettings"],
      transformResponse: transformCustomMonthSettingsResponse,
    }),
    getDefaultMonthSettings: builder.query<
      monthDefaultSettingsType,
      yearAndMonth
    >({
      query: ({ month, year }) => ({
        url: "/getdefaultmonthsettings",
        method: "post",
        body: { month, year },
      }),
    }),
    getSpreadsheet: builder.mutation<string, getSpreadsheetQueryArg>({
      query: ({
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
        streamClientId,
      }) => ({
        url: "/getspreadsheet",
        method: "post",
        body: {
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
          streamClientId,
        },
      }),
    }),
    updateDateProperty: builder.mutation<string, updateDatePropertyQueryArg>({
      query: ({ date, month, year, key, value }) => ({
        url: "/updatedateproperty",
        method: "PUT",
        body: { date, month, year, key, value },
      }),
    }),
    updateDates: builder.mutation<string, updateDatesQueryArg>({
      query: ({ dates, month, year, inputDisabled }) => ({
        url: "/updatedates",
        method: "PUT",
        body: { dates, month, year, inputDisabled },
      }),
    }),
    logInUser: builder.mutation<logInUserResultType, logInUserQueryArg>({
      query: ({ email, password }) => ({
        url: "/login",
        method: "POST",
        body: { email, password },
      }),
      invalidatesTags: ["MonthSettings", "UserSettings", "Dates"],
    }),
    updateCustomMonthSettings: builder.mutation<
      string,
      updateCustomMonthSettingsQueryArg
    >({
      query: ({ customMonthSettings, month, year }) => ({
        url: "/updatecustommonthsettings",
        method: "PUT",
        body: { customMonthSettings, month, year },
      }),
      // invalidatesTags: ["MonthSettings"],
    }),
    updateUserSettings: builder.mutation<string, userSettingsUntransformedType>(
      {
        query: (userSettings) => ({
          url: "/updateusersettings",
          method: "PUT",
          body: userSettings,
        }),
        invalidatesTags: ["UserSettings"],
      },
    ),
    updatePreferredLanguage: builder.mutation<
      string,
      updatePreferredLanguageQueryArg
    >({
      query: (languageCode) => ({
        url: "/updatepreferredlanguage",
        method: "PUT",
        body: { languageCode },
      }),
      // invalidatesTags: ["UserSettings"],
    }),
    updateInputDisabled: builder.mutation<string, updateInputDisabledQueryArg>({
      query: ({ month, year, inputDisabled }) => ({
        url: "/updatelockstatus",
        method: "PUT",
        body: { month, year, inputDisabled },
      }),
    }),
  }),
});

export const {
  useGetDatesQuery,
  useUpdateDatesMutation,
  useUpdateDatePropertyMutation,
  useGetUserSettingsQuery,
  useGetCustomMonthSettingsQuery,
  useGetDefaultMonthSettingsQuery,
  useGetSpreadsheetMutation,
  useUpdateCustomMonthSettingsMutation,
  useUpdateUserSettingsMutation,
  useLogInUserMutation,
  useUpdatePreferredLanguageMutation,
} = apiSlice;
