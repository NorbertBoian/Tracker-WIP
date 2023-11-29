import { englishWeekdaysArray } from "../constants/constants";
import { disabledDaysType, requiredHoursType } from "../slices/apiSliceTypes";
import {
  applicationSettingsType,
  getLocalStorageItem,
  month,
} from "../utils/typedLocalStorage/typedLocalStorage";

export const getGuestDefaultMonthSettings = (
  monthCreatedAt?: month["createdAt"],
  applicationSettings?: Omit<applicationSettingsType, "createdAt">,
) => {
  if (monthCreatedAt && applicationSettings) {
    const localStorageApplicationSettings = getLocalStorageItem(
      "applicationSettings",
    );
    const sanitizedLocalStorageApplicationSettings =
      localStorageApplicationSettings ? localStorageApplicationSettings : [];

    const firstApplicationSettingsThatPrecedesMonthCreation =
      sanitizedLocalStorageApplicationSettings
        .reverse()
        .find((applicationSettings) => {
          const applicationSettingCreatedAtDate = new Date(
            applicationSettings.createdAt,
          );
          const monthCreatedAtDate = new Date(monthCreatedAt);
          return monthCreatedAtDate > applicationSettingCreatedAtDate;
        });

    const sanitizedFoundApplicationSettings =
      firstApplicationSettingsThatPrecedesMonthCreation
        ? firstApplicationSettingsThatPrecedesMonthCreation
        : applicationSettings;

    const monthDefaultDisabledDays = {} as disabledDaysType;
    const monthDefaultRequiredHours = {} as requiredHoursType;

    for (const weekday of englishWeekdaysArray) {
      Object.assign(monthDefaultDisabledDays, {
        [weekday]:
          sanitizedFoundApplicationSettings.weekdays[weekday].disabledDay,
      });
      Object.assign(monthDefaultRequiredHours, {
        [weekday]:
          sanitizedFoundApplicationSettings.weekdays[weekday].requiredHours,
      });
    }

    const monthDefaultOvertimeMultiplier =
      sanitizedFoundApplicationSettings.overtimeMultiplier;

    const monthDefaultHourlyRate = sanitizedFoundApplicationSettings.hourlyRate;

    return {
      monthDefaultHourlyRate,
      monthDefaultOvertimeMultiplier,
      monthDefaultDisabledDays,
      monthDefaultRequiredHours,
    };
  } else return undefined;
};
