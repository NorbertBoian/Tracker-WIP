import { englishWeekdaysArray } from "../constants/constants";
import { apiSlice } from "../slices/apiSlice";
import {
  monthCustomDisabledDaysType,
  requiredHoursType,
} from "../slices/apiSliceTypes";
import { replaceUndefinedDisabledDays } from "./replaceUndefinedDisabledDays";
import { monthSettingsChanged } from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import { monthSettingsType } from "../utils/typedLocalStorage/typedLocalStorage";
import { getCreateNotification } from "./createNotification/createNotification";
import { getRateLimitedFunction } from "./getRateLimitedFunction";
import { updateMonthPropertyInLocalStorage } from "./updateMonthPropertyInLocalStorage";

export const clientMonthSettingsToServerMonthSettings = (
  monthSettings: monthSettingsType,
) => {
  const monthCustomRequiredHours = {} as requiredHoursType;
  const monthCustomDisabledDays = {} as monthCustomDisabledDaysType;
  for (const weekday of englishWeekdaysArray) {
    Object.assign(monthCustomRequiredHours, {
      [weekday]: monthSettings.weekdays[weekday].requiredHours,
    });
    Object.assign(monthCustomDisabledDays, {
      [weekday]: monthSettings.weekdays[weekday].disabledDay,
    });
  }
  return {
    monthCustomHourlyRate: monthSettings.hourlyRate,
    monthCustomOvertimeMultiplier: monthSettings.overtimeMultiplier,
    monthCustomRequiredHours,
    monthCustomDisabledDays,
  };
};

const createFailNotification = getCreateNotification(
  "Failed to save month settings on server.",
  "alert",
);

const createSuccessNotification = getCreateNotification(
  "Saved month settings.",
);

const setMonthSettingsInLongTermStorage = async (
  monthSettings: monthSettingsType,
) => {
  const { year, month, email } = store.getState().main;
  const { dispatch } = store;
  if (email) {
    const response = await dispatch(
      apiSlice.endpoints.updateCustomMonthSettings.initiate({
        customMonthSettings:
          clientMonthSettingsToServerMonthSettings(monthSettings),
        month,
        year,
      }),
    );
    if ("error" in response) {
      createFailNotification();
    } else {
      createSuccessNotification();
    }
  } else {
    updateMonthPropertyInLocalStorage(
      year,
      month,
      "monthSettings",
      monthSettings,
    );
  }
};

const rateLimitedSetMonthSettingsInLongTermStorage = getRateLimitedFunction(
  setMonthSettingsInLongTermStorage,
  100,
  false,
);

export const setMonthSettings = () => {
  const { dispatch } = store;
  const { applicationSettings } = store.getState().main;
  const { weekdays, hourlyRate, overtimeMultiplier } =
    store.getState().monthSettings;

  if (applicationSettings.data) {
    const monthSettingsWeekdays = replaceUndefinedDisabledDays(
      weekdays,
      applicationSettings.data.weekdays,
    );

    const monthSettings = {
      hourlyRate,
      overtimeMultiplier,
      weekdays: monthSettingsWeekdays,
    };

    dispatch(
      monthSettingsChanged({
        data: monthSettings,
        isFetching: false,
        isSuccess: true,
      }),
    );
    rateLimitedSetMonthSettingsInLongTermStorage(monthSettings);
  }
};
