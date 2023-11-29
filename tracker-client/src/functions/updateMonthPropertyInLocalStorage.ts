import { englishMonthsArray, monthNumberType } from "../constants/constants";
import { getEmptyDatesArray } from "../utils/getEmptyDatesArray";
import {
  getLocalStorageItem,
  setLocalStorageItem,
  month,
} from "../utils/typedLocalStorage/typedLocalStorage";
import { blankMonthSettings } from "./getLocalStorageMonthData";

export const updateMonthPropertyInLocalStorage = <Key extends keyof month>(
  year: number,
  month: monthNumberType,
  key: Key,
  value: month[Key],
) => {
  const englishMonthName = englishMonthsArray[month];

  const blankLocalStorageMonth = {
    createdAt: Date.now(),
    dates: getEmptyDatesArray(year, month),
    lockedInputs: false,
    monthSettings: blankMonthSettings,
  };

  const localStorageYears = getLocalStorageItem("years");
  const sanitizedLocalStorageYears = localStorageYears ? localStorageYears : {};

  const localStorageYear = sanitizedLocalStorageYears[year];
  const sanitizedLocalStorageYear = localStorageYear ? localStorageYear : {};

  const localStorageMonth = sanitizedLocalStorageYear[englishMonthName];
  const sanitizedLocalStorageMonth = localStorageMonth
    ? localStorageMonth
    : blankLocalStorageMonth;

  const updatedYears = {
    ...sanitizedLocalStorageYears,
    [year]: {
      ...sanitizedLocalStorageYear,
      [englishMonthName]: {
        ...sanitizedLocalStorageMonth,
        [key]: value,
      },
    },
  };

  setLocalStorageItem("years", updatedYears);
};
