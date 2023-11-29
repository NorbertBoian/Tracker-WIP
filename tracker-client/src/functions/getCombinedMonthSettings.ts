import { englishWeekdaysArray } from "../constants/constants";
import {
  disabledDaysType,
  monthCustomSettingsType,
  requiredHoursType,
} from "../slices/apiSliceTypes";

export const getCombinedMonthSettings = (
  monthCustomSettings?: monthCustomSettingsType,
  monthDefaultSettings?: {
    monthDefaultHourlyRate: string;
    monthDefaultOvertimeMultiplier: string;
    monthDefaultRequiredHours: requiredHoursType;
    monthDefaultDisabledDays: disabledDaysType;
  },
) => {
  if (monthCustomSettings && monthDefaultSettings) {
    const {
      monthCustomRequiredHours,
      monthCustomOvertimeMultiplier,
      monthCustomHourlyRate,
      monthCustomDisabledDays,
    } = monthCustomSettings;

    const {
      monthDefaultRequiredHours,
      monthDefaultOvertimeMultiplier,
      monthDefaultHourlyRate,
      monthDefaultDisabledDays,
    } = monthDefaultSettings;

    const monthlyDisabledDays = {} as disabledDaysType;

    for (const weekday of englishWeekdaysArray) {
      const monthlyDisabledDay =
        monthCustomDisabledDays[weekday] !== undefined
          ? monthCustomDisabledDays[weekday]
          : monthDefaultDisabledDays[weekday];
      Object.assign(monthlyDisabledDays, {
        [weekday]: monthlyDisabledDay,
      });
    }

    const monthlyRequiredHours = {} as requiredHoursType;

    for (const weekday of englishWeekdaysArray) {
      const combinedRequiredHours = monthCustomRequiredHours[weekday]
        ? monthCustomRequiredHours[weekday]
        : monthDefaultRequiredHours[weekday];
      Object.assign(monthlyRequiredHours, {
        [weekday]: combinedRequiredHours,
      });
    }

    const monthlyOvertimeMultiplier =
      monthCustomOvertimeMultiplier !== ""
        ? monthCustomOvertimeMultiplier
        : monthDefaultOvertimeMultiplier;

    const monthlyHourlyRate =
      monthCustomHourlyRate !== ""
        ? monthCustomHourlyRate
        : monthDefaultHourlyRate;

    return {
      monthlyHourlyRate,
      monthlyOvertimeMultiplier,
      monthlyRequiredHours,
      monthlyDisabledDays,
    };
  } else return undefined;
};
