import { englishWeekdaysArray } from "../../../../constants/constants";
import { requiredHoursType } from "../../../../slices/apiSliceTypes";
import { computeSalary } from "../../../../utils/computeSalary";
import { IDate } from "../../../../utils/getEmptyDatesArray";
import { stringToMinutes } from "../../../../utils/stringToMinutes";

const getMinutesWorked = (beganString: string, endedString: string) => {
  const beganMinutes = stringToMinutes(beganString);
  const endedMinutes = stringToMinutes(endedString);
  const minutesWorked =
    beganMinutes === undefined || endedMinutes === undefined
      ? undefined
      : Math.max(endedMinutes - beganMinutes, 0);
  return minutesWorked;
};

const minutesToHoursAndMinutes = (onlyMinutes: number) => {
  const hours = `${Math.floor(onlyMinutes / 60)}`;
  const minutes = `0${onlyMinutes % 60}`.slice(-2);
  return { hours, minutes };
};

export const getEarnedAndHoursStrings = (
  enabledDays: IDate[],
  monthlyHourlyRate: string,
  monthlyOvertimeMultiplier: string,
  monthlyRequiredHours: requiredHoursType,
  localizedHoursString: string,
  localizedMinutesString: string,
  displayedCurrency: string,
) => {
  const monthlySalary = enabledDays.reduce((prev, date) => {
    const {
      hourlyRate: dailyHourlyRate,
      overtimeMultiplier: dailyOvertimeMultiplier,
      requiredHours: dailyHoursRequired,
      beganString,
      endedString,
    } = date;

    const dateObj = new Date(date.date);
    const weekdayIndex = dateObj.getDay();

    const hourlyRate =
      dailyHourlyRate !== "" ? dailyHourlyRate : monthlyHourlyRate;

    const overtimeMultiplier =
      dailyOvertimeMultiplier !== ""
        ? dailyOvertimeMultiplier
        : monthlyOvertimeMultiplier;

    const hoursRequired =
      dailyHoursRequired !== ""
        ? dailyHoursRequired
        : monthlyRequiredHours[englishWeekdaysArray[weekdayIndex]];

    const minutesWorked = getMinutesWorked(beganString, endedString);

    const salary = computeSalary(
      +hoursRequired,
      minutesWorked ?? 0,
      +hourlyRate.replace(",", "."),
      +overtimeMultiplier.replace(",", "."),
    );

    return prev + salary;
  }, 0);

  const monthlyMinutesWorked = enabledDays.reduce((prev, date) => {
    const { beganString, endedString } = date;
    const minutesWorked = getMinutesWorked(beganString, endedString) ?? 0;

    return prev + minutesWorked;
  }, 0);

  const { hours, minutes } = minutesToHoursAndMinutes(monthlyMinutesWorked);

  const hoursWorkedString =
    monthlyMinutesWorked > 0
      ? `${hours} ${localizedHoursString} ${minutes} ${localizedMinutesString}`
      : `0 ${localizedMinutesString}`;

  const earnedString = `${monthlySalary.toFixed(2)} ${displayedCurrency}`;

  return { hoursWorkedString, earnedString };
};
