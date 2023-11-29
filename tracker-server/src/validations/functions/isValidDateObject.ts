import { isValidDateNumber } from "./isValidDateNumber";
import { isValidHolidayStatus } from "./isValidHolidayStatus";
import { isValidHourlyRateTrailingDecimalPointAllowed } from "./isValidHourlyRate";
import { isValidOvertimeMultiplierTrailingDecimalPointAllowed } from "./isValidOvertimeMultiplier";
import { isValidRequiredHours } from "./isValidRequiredHours";
import { isValidBeganString, isValidEndedString } from "./isValidTimeString";
import { matchesKeyArrayExactly } from "./matchesKeyArrayExactly";

const expectedDateObjectKeys = [
  "date",
  "beganString",
  "endedString",
  "isHoliday",
  "overtimeMultiplier",
  "hourlyRate",
  "requiredHours",
] as const;

export const isValidDateObject = (value: unknown) => {
  const unknownValuesDateObject = matchesKeyArrayExactly(
    value,
    expectedDateObjectKeys,
  );
  if (unknownValuesDateObject instanceof Error) return unknownValuesDateObject;

  const {
    date,
    beganString,
    endedString,
    isHoliday,
    overtimeMultiplier,
    hourlyRate,
    requiredHours,
  } = unknownValuesDateObject;

  const validDate = isValidDateNumber(date);
  if (validDate instanceof Error) return validDate;

  const validBeganString = isValidBeganString(beganString);
  if (validBeganString instanceof Error) return validBeganString;

  const validEndedString = isValidEndedString(endedString);
  if (validEndedString instanceof Error) return validEndedString;

  const validIsHoliday = isValidHolidayStatus(isHoliday);
  if (validIsHoliday instanceof Error) return validIsHoliday;

  const validOvertimeMultiplier =
    isValidOvertimeMultiplierTrailingDecimalPointAllowed(overtimeMultiplier);
  if (validOvertimeMultiplier instanceof Error) return validOvertimeMultiplier;

  const validHourlyRate =
    isValidHourlyRateTrailingDecimalPointAllowed(hourlyRate);
  if (validHourlyRate instanceof Error) return validHourlyRate;

  const validRequiredHours = isValidRequiredHours(requiredHours);
  if (validRequiredHours instanceof Error) return validRequiredHours;

  const validDateObject = {
    date: validDate,
    beganString: validBeganString,
    endedString: validEndedString,
    isHoliday: validIsHoliday,
    overtimeMultiplier: validOvertimeMultiplier,
    hourlyRate: validHourlyRate,
    requiredHours: validRequiredHours,
  };

  return validDateObject;
};
