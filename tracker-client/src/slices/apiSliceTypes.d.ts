import {
  dateNumberType,
  englishWeekdayType,
  languageCodeType,
  monthNumberType,
} from "../constants/constants";
import { Dates, IDate } from "../utils/getEmptyDatesArray";
import { pastAndFutureType } from "./mainSlice/functions/getMainSliceInitialState";

export type yearAndMonth = {
  year: number;
  month: monthNumberType;
};

export type datesHistory = {
  past: pastAndFutureType;
  present: Dates;
  future: pastAndFutureType;
};

export type getDatesResultType = {
  inputDisabled: boolean;
  dates: Dates;
};

export type getDatesResultBeforeTransform =
  | {
      inputDisabled: boolean;
      dates: Dates;
    }
  | string;

export type requiredHoursType = {
  [weekday in englishWeekdayType]: string;
};
export type disabledDaysType = {
  [weekday in englishWeekdayType]: boolean;
};

export type monthDefaultSettingsType =
  | {
      monthDefaultHourlyRate: string;
      monthDefaultOvertimeMultiplier: string;
      monthDefaultRequiredHours: requiredHoursType;
      monthDefaultDisabledDays: disabledDaysType;
    }
  | string;

export type userDefaultDaysColorsType = {
  [weekday in englishWeekdayType]: [number, number, number];
};

export type userSettingsType = {
  userDefaultHourlyRate: string;
  userDefaultOvertimeMultiplier: string;
  userDefaultRequiredHours: { [weekday in englishWeekdayType]: string };
  userDefaultDisabledDays: { [weekday in englishWeekdayType]: boolean };
  userDefaultDaysColors: userDefaultDaysColorsType;
  languageCode: languageCodeType;
  autosaveInterval: number;
  displayedCurrency: string;
};

export type userSettingsUntransformedType = Omit<
  userSettingsType,
  "userDefaultDaysColors"
> & {
  userDefaultDaysColors: Partial<userDefaultDaysColorsType>;
} extends infer O
  ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
  : never;

export type monthCustomDisabledDaysType = {
  [weekday in englishWeekdayType]: boolean | undefined;
};

export type monthCustomSettingsType = {
  monthCustomHourlyRate: string;
  monthCustomOvertimeMultiplier: string;
  monthCustomRequiredHours: requiredHoursType;
  monthCustomDisabledDays: monthCustomDisabledDaysType;
};

export type dateProperty = {
  [Key in keyof IDate]: { key: Key; value: IDate[Key] };
} extends infer datePropertiesObject
  ? datePropertiesObject[keyof datePropertiesObject]
  : never;

export type updateDatePropertyQueryArg = {
  date: dateNumberType;
  year: number;
  month: monthNumberType;
} & dateProperty extends infer O
  ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
  : never;
export type updateDatesQueryArg = {
  year: number;
  month: monthNumberType;
  dates: DateObject[];
  inputDisabled: boolean;
};
export type getSpreadsheetQueryArg = {
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  preferredLanguage: languageCodeType;
  month: monthNumberType;
  year: number;
  requiredHours: requiredHoursType;
  disabledDays: disabledDaysType;
  weekdaysColors: userDefaultDaysColorsType;
  filteredDates: IDate[];
  streamClientId?: string;
};

export type logInUserQueryArg = {
  email: string;
  password: string;
};

export type logInUserResultType = { loggedIn: true; message: string } | string;

export type updateCustomMonthSettingsQueryArg = {
  year: number;
  month: monthNumberType;
  customMonthSettings: monthCustomSettingsType;
};

export type updatePreferredLanguageQueryArg = languageCodeType;

export type updateInputDisabledQueryArg = {
  year: number;
  month: monthNumberType;
  inputDisabled: boolean;
};
