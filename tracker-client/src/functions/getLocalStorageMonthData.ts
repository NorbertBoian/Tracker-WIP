import {
  englishMonthsArray,
  englishWeekdaysArray,
  monthNumberType,
} from "../constants/constants";
import { getEmptyDatesArray } from "../utils/getEmptyDatesArray";
import {
  getLocalStorageItem,
  monthSettingsType,
  monthSettingsWeekdaysType,
} from "../utils/typedLocalStorage/typedLocalStorage";

const weekDayInitialState = {
  requiredHours: "",
  disabledDay: undefined as boolean | undefined,
};

export const monthSettingsBlankWeekdays =
  englishWeekdaysArray.reduce<monthSettingsWeekdaysType>(
    (prevValue, weekday) => {
      const weekDayProperty = {
        [weekday]: weekDayInitialState,
      };
      const newValue = { ...prevValue, ...weekDayProperty };
      return newValue;
    },
    {} as monthSettingsWeekdaysType,
  );

export const blankMonthSettings: monthSettingsType = {
  weekdays: monthSettingsBlankWeekdays,
  hourlyRate: "",
  overtimeMultiplier: "",
};

export const getLocalStorageMonthData = (
  year: number,
  month: monthNumberType,
) => {
  const monthBlankDates = getEmptyDatesArray(year, month);
  const monthBlankData = {
    dates: monthBlankDates,
    lockedInputs: false,
    monthSettings: blankMonthSettings,
    createdAt: undefined,
    // createdAt: Date.now(),
  };

  const englishMonthName = englishMonthsArray[month];

  const localStorageYears = getLocalStorageItem("years");

  return localStorageYears?.[year]?.[englishMonthName] ?? monthBlankData;
};
