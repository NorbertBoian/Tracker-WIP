import { weekDays } from "../../../constants/constants";
import { getChangeHandlers } from "./getChangeHandlers";

export const getDayProps = (
  monthlyHourlyRate,
  monthlyOvertimeMultiplier,
  monthlyRequiredHours,
  date,
  isLoggedIn,
) => {
  const {
    hourlyRate: dailyHourlyRate,
    overtimeMultiplier: dailyOvertimeMultiplier,
    requiredHours: dailyHoursRequired,
  } = date;

  const dateObj = new Date(date.date);
  const weekDayIndex = dateObj.getDay();
  const dateIndex = dateObj.getDate();

  const {
    getHandleHolidayChange,
    getHandleDayPropertyChange,
    getHandleDayTimeInputChange,
  } = getChangeHandlers(isLoggedIn);

  const hourlyRate =
    dailyHourlyRate !== "" ? dailyHourlyRate : monthlyHourlyRate;

  const overtimeMultiplier =
    dailyOvertimeMultiplier !== ""
      ? dailyOvertimeMultiplier
      : monthlyOvertimeMultiplier;

  const hoursRequired =
    dailyHoursRequired !== ""
      ? dailyHoursRequired
      : monthlyRequiredHours[weekDays[weekDayIndex]];

  const setBeganStringValue = getHandleDayTimeInputChange(
    "beganString",
    dateIndex,
  );
  const setEndedStringValue = getHandleDayTimeInputChange(
    "endedString",
    dateIndex,
  );

  const setIsHoliday = getHandleHolidayChange(dateIndex);

  const setHourlyRate = getHandleDayPropertyChange("hourlyRate", dateIndex);
  const setOvertimeMultiplier = getHandleDayPropertyChange(
    "overtimeMultiplier",
    dateIndex,
  );
  const setHoursRequired = getHandleDayPropertyChange(
    "requiredHours",
    dateIndex,
  );

  return {
    hourlyRate,
    dailyHourlyRate,
    overtimeMultiplier,
    dailyOvertimeMultiplier,
    hoursRequired,
    dailyHoursRequired,
    setBeganStringValue,
    setEndedStringValue,
    setIsHoliday,
    setHourlyRate,
    setOvertimeMultiplier,
    setHoursRequired,
  };
};
