import {
  englishMonthNameType,
  englishWeekdayType,
  languageCodeType,
} from "../../constants/constants";

export type applicationSettingsWeekdaysType = {
  [weekday in englishWeekdayType]: {
    requiredHours: string;
    disabledDay: boolean;
    color: [number, number, number];
  };
};

export type monthSettingsWeekdaysType = {
  [weekday in englishWeekdayType]: {
    requiredHours: string;
    disabledDay: boolean;
  };
};

export type applicationSettingsType = {
  weekdays: applicationSettingsWeekdaysType;
  hourlyRate: string;
  overtimeMultiplier: string;
  createdAt: number;
};

export type monthSettingsType = {
  weekdays: monthSettingsWeekdaysType;
  hourlyRate: string;
  overtimeMultiplier: string;
};

type date = {
  beganString: string;
  endedString: string;
  date: number;
  hourlyRate: string;
  isHoliday: boolean;
  overtimeMultiplier: string;
  requiredHours: string;
};
export type month = {
  createdAt: number;
  dates: [Record<string, never>, ...date[]];
  lockedInputs: boolean;
  monthSettings: monthSettingsType;
};

type year = Partial<{
  [monthName in englishMonthNameType]: month;
}>;

export type typedLocalStorage = {
  applicationSettings: applicationSettingsType[];
  displayedCurrency: string;
  autosaveInterval: number;
  preferredLanguageCode: languageCodeType;
  years: { [key: string]: year };
};

export const getLocalStorageItem = <Key extends keyof typedLocalStorage>(
  key: Key,
) => {
  const item = localStorage.getItem(key);
  const parsedItem = item
    ? (JSON.parse(item) as typedLocalStorage[Key])
    : undefined;
  return parsedItem;
};

export const setLocalStorageItem = <Key extends keyof typedLocalStorage>(
  key: Key,
  value: typedLocalStorage[Key],
) => {
  localStorage.setItem(key, JSON.stringify(value));
};
