import { englishWeekdaysArray } from "../../../constants/constants";
import { disabledDaysType } from "../../../slices/apiSliceTypes";
import { Dates } from "../../../utils/getEmptyDatesArray";

export const getDaysEnabledStatus = (
  dates: Dates,
  monthlyDisabledDays: disabledDaysType,
) => {
  const enabledDaysArray = englishWeekdaysArray.map(
    (weekday) => !monthlyDisabledDays[weekday],
  );

  const daysEnabledStatus = dates.map((date) => {
    if (date) {
      const dateObj = new Date(date.date);
      const day = dateObj.getDay();
      return enabledDaysArray[day];
    } else return false;
  });

  return daysEnabledStatus;
};
