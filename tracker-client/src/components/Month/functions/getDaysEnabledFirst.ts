import { englishWeekdaysArray } from "../../../constants/constants";
import { disabledDaysType } from "../../../slices/apiSliceTypes";
import { Dates, IDate } from "../../../utils/getEmptyDatesArray";

export const getDaysEnabledFirst = (
  dates: Dates,
  monthlyDisabledDays: disabledDaysType,
): [IDate[], number] => {
  const enabledDaysArray = englishWeekdaysArray.map(
    (weekday) => !monthlyDisabledDays[weekday],
  );
  const datesWithoutFirstUndefined = dates.slice(1) as IDate[];
  const filterDates = (date: IDate) => {
    const dateObj = new Date(date.date);
    const day = dateObj.getDay();
    return enabledDaysArray[day];
  };
  const enabledDays = datesWithoutFirstUndefined.filter(filterDates);
  const disabledDays = datesWithoutFirstUndefined.filter(
    (date) => !filterDates(date),
  );

  const daysEnabledFirst = [...enabledDays, ...disabledDays];

  return [daysEnabledFirst, enabledDays.length];
};
