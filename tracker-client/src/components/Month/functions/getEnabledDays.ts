import { englishWeekdaysArray } from "../../../constants/constants";
import { disabledDaysType } from "../../../slices/apiSliceTypes";
import { Dates, IDate } from "../../../utils/getEmptyDatesArray";

export const getEnabledDays = (
  dates: Dates,
  monthlyDisabledDays: disabledDaysType,
) => {
  const enabledDaysArray = englishWeekdaysArray.map(
    (weekday) => !monthlyDisabledDays[weekday],
  );

  const filterDates = (date: IDate) => {
    const dateObj = new Date(date.date);
    const day = dateObj.getDay();
    return enabledDaysArray[day];
  };

  const datesWithoutFirstUndefined = dates.slice(1) as IDate[];
  const enabledDays = datesWithoutFirstUndefined.filter(filterDates);
  return enabledDays;
};
