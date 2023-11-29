import { englishWeekdayType, monthNumberType } from "../constants/constants";
import { apiSlice } from "../slices/apiSlice";
import {
  datesHistory,
  monthCustomSettingsType,
  updateDatePropertyQueryArg,
  userSettingsType,
  userSettingsUntransformedType,
} from "../slices/apiSliceTypes";
import { pastAndFutureType } from "../slices/mainSlice/functions/getMainSliceInitialState";
import { store } from "../store";
import { DateObject, Dates, IDate } from "./getEmptyDatesArray";

const { dispatch } = store;

export const getDates = (month: monthNumberType, year: number) => {
  const { data, isError } = apiSlice.endpoints.getDates.select({
    month,
    year,
  })(store.getState());
  return !isError && data ? data : undefined;
};

export const updateDateProperty = <Key extends keyof IDate>(
  month: monthNumberType,
  year: number,
  dateNumber: number,
  key: Key,
  value: IDate[Key],
) => {
  const property = { key, value };
  return dispatch(
    apiSlice.endpoints.updateDateProperty.initiate({
      month,
      year,
      date: dateNumber,
      ...property,
    } as updateDatePropertyQueryArg),
  );
};

export const updateDatesLocally = (
  year: number,
  month: monthNumberType,
  dates: datesHistory,
) =>
  dispatch(
    apiSlice.util.updateQueryData("getDates", { year, month }, (draft) => {
      draft.dates = dates;
    }),
  );

export const updateDatePropertyLocally = <Key extends keyof IDate>(
  year: number,
  month: monthNumberType,
  dateNumber: number,
  key: Key,
  value: IDate[Key],
) => {
  const { focusedDay, focusedField } = store.getState().main;
  dispatch(
    apiSlice.util.updateQueryData("getDates", { year, month }, (draft) => {
      const past: pastAndFutureType = [
        {
          focusedDay,
          focusedField,
          value: [...draft.dates.present],
        },
        ...draft.dates.past,
      ];

      const presentWithoutNoughthDay = [...draft.dates.present].slice(
        1,
      ) as IDate[];

      presentWithoutNoughthDay[dateNumber - 1] = {
        ...presentWithoutNoughthDay[dateNumber - 1],
        [key]: value,
      };

      const present: Dates = [{}, ...presentWithoutNoughthDay];

      const future: pastAndFutureType = [];

      draft.dates = { past, present, future };
    }),
  );
};

export const updateDayColorLocally = (
  englishWeekday: englishWeekdayType,
  color: [number, number, number],
  email: string,
) => {
  dispatch(
    apiSlice.util.updateQueryData("getUserSettings", email, (draft) => {
      draft.userDefaultDaysColors = {
        ...draft.userDefaultDaysColors,
        [englishWeekday]: color,
      };
    }),
  );
};

export const updateUserSettingLocally = <Key extends keyof userSettingsType>(
  setting: Key,
  settingValue: userSettingsType[Key],
  email: string,
) => {
  dispatch(
    apiSlice.util.updateQueryData("getUserSettings", email, (draft) => {
      draft[setting] = settingValue;
    }),
  );
};

export const updateUserRequiredHoursLocally = (
  englishWeekday: englishWeekdayType,
  string: string,
  email: string,
) =>
  dispatch(
    apiSlice.util.updateQueryData("getUserSettings", email, (draft) => {
      draft.userDefaultRequiredHours[englishWeekday] = string;
    }),
  );

export const toggleUserDisabledDaysLocally = (
  englishWeekday: englishWeekdayType,
  email: string,
) =>
  dispatch(
    apiSlice.util.updateQueryData("getUserSettings", email, (draft) => {
      draft.userDefaultDisabledDays[englishWeekday] =
        !draft.userDefaultDisabledDays[englishWeekday];
    }),
  );

export const updateMonthDisabledDaysLocally = (
  month: monthNumberType,
  year: number,
  englishWeekday: englishWeekdayType,
  value: boolean,
) =>
  dispatch(
    apiSlice.util.updateQueryData(
      "getCustomMonthSettings",
      { month, year },
      (draft) => {
        draft.monthCustomDisabledDays = {
          ...draft.monthCustomDisabledDays,
          [englishWeekday]: value,
        };
      },
    ),
  );

export const updateCustomMonthSettingLocally = <
  Key extends keyof monthCustomSettingsType,
>(
  month: monthNumberType,
  year: number,
  setting: Key,
  settingValue: monthCustomSettingsType[Key],
) =>
  dispatch(
    apiSlice.util.updateQueryData(
      "getCustomMonthSettings",
      { month, year },
      (draft) => {
        draft[setting] = settingValue;
      },
    ),
  );

export const updateCustomMonthRequiredHoursLocally = (
  month: monthNumberType,
  year: number,
  englishWeekday: englishWeekdayType,
  string: string,
) =>
  dispatch(
    apiSlice.util.updateQueryData(
      "getCustomMonthSettings",
      { month, year },
      (draft) => {
        draft.monthCustomRequiredHours[englishWeekday] = string;
      },
    ),
  );

export const updateDates = (
  dates: DateObject[],
  month: monthNumberType,
  year: number,
  inputDisabled: boolean,
) =>
  dispatch(
    apiSlice.endpoints.updateDates.initiate({
      dates,
      month,
      year,
      inputDisabled,
    }),
  );

export const updateCustomMonthSettings = (
  customMonthSettings: monthCustomSettingsType,
  month: monthNumberType,
  year: number,
) =>
  dispatch(
    apiSlice.endpoints.updateCustomMonthSettings.initiate({
      customMonthSettings,
      month,
      year,
    }),
  );

export const updateUserSettings = (
  userSettings: userSettingsUntransformedType,
) => {
  dispatch(apiSlice.endpoints.updateUserSettings.initiate(userSettings));
};
