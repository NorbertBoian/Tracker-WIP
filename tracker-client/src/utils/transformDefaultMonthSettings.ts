import { clientApplicationSettingsToServerApplicationSettings } from "../functions/setApplicationSettings";
import {
  monthDefaultSettingsType,
  userSettingsType,
} from "../slices/apiSliceTypes";
import { store } from "../store";
import { isObject } from "./isObject";
import { userDefaultsBlankResponse } from "./transformUserSettings";

const getUserMonthDefaultSettingsFallbackResponse = (
  userSettingsData: userSettingsType | undefined,
) => {
  const transformedUserSettingsData = userSettingsData
    ? userSettingsData
    : userDefaultsBlankResponse;

  const {
    userDefaultRequiredHours: monthDefaultRequiredHours,
    userDefaultOvertimeMultiplier: monthDefaultOvertimeMultiplier,
    userDefaultHourlyRate: monthDefaultHourlyRate,
    userDefaultDisabledDays: monthDefaultDisabledDays,
  } = transformedUserSettingsData;

  const defaultMonthFallbackResponse = {
    monthDefaultRequiredHours,
    monthDefaultDisabledDays,
    monthDefaultOvertimeMultiplier,
    monthDefaultHourlyRate,
  };

  return defaultMonthFallbackResponse;
};

export const transformDefaultMonthSettings = (
  data?: monthDefaultSettingsType | string | null,
) => {
  if (!data || typeof data === "string" || !isObject(data)) {
    const {
      applicationSettings,
      languageCode,
      displayedCurrency,
      autosaveInterval,
    } = store.getState().main;

    const applicationSettingsData =
      applicationSettings.data &&
      displayedCurrency.data &&
      languageCode.data &&
      autosaveInterval.data !== undefined
        ? {
            ...applicationSettings.data,
            languageCode: languageCode.data,
            autosaveInterval: autosaveInterval.data,
            displayedCurrency: displayedCurrency.data,
          }
        : undefined;

    const userSettingsData = applicationSettingsData
      ? clientApplicationSettingsToServerApplicationSettings(
          applicationSettingsData,
        )
      : undefined;
    const defaultMonthFallbackResponse =
      getUserMonthDefaultSettingsFallbackResponse(userSettingsData);
    return defaultMonthFallbackResponse;
  } else {
    return data;
  }
};
