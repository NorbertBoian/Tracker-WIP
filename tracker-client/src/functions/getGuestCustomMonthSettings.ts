import { englishWeekdaysArray } from "../constants/constants";
import { disabledDaysType, requiredHoursType } from "../slices/apiSliceTypes";
import { monthSettingsType } from "../utils/typedLocalStorage/typedLocalStorage";

export const getGuestCustomMonthSettings = (
  monthSettings?: monthSettingsType,
) => {
  if (monthSettings) {
    const {
      hourlyRate: monthCustomHourlyRate,
      overtimeMultiplier: monthCustomOvertimeMultiplier,
      weekdays: monthCustomWeekdays,
    } = monthSettings;

    const monthCustomDisabledDays = {} as disabledDaysType;
    const monthCustomRequiredHours = {} as requiredHoursType;

    for (const weekday of englishWeekdaysArray) {
      Object.assign(monthCustomDisabledDays, {
        [weekday]: monthCustomWeekdays[weekday].disabledDay,
      });
      Object.assign(monthCustomRequiredHours, {
        [weekday]: monthCustomWeekdays[weekday].requiredHours,
      });
    }

    return {
      monthCustomRequiredHours,
      monthCustomOvertimeMultiplier,
      monthCustomHourlyRate,
      monthCustomDisabledDays,
    };
  } else return undefined;
};
