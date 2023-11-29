import { isValidDateNumber } from "./functions/isValidDateNumber";
import { isValidHolidayStatus } from "./functions/isValidHolidayStatus";
import { isValidHourlyRate } from "./functions/isValidHourlyRate";
import { isValidKeyValuePair } from "./functions/isValidKeyValuePair";
import { isValidMonthNumber } from "./functions/isValidMonthNumber";
import { isValidOvertimeMultiplier } from "./functions/isValidOvertimeMultiplier";
import { isValidRequiredHours } from "./functions/isValidRequiredHours";
import {
  isValidBeganString,
  isValidEndedString,
} from "./functions/isValidTimeString";
import { isValidYearNumber } from "./functions/isValidYearNumber";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["date", "key", "value", "year", "month"];

const keyValueTestFunctionObject = {
  date: isValidDateNumber,
  beganString: isValidBeganString,
  endedString: isValidEndedString,
  isHoliday: isValidHolidayStatus,
  overtimeMultiplier: isValidOvertimeMultiplier,
  hourlyRate: isValidHourlyRate,
  requiredHours: isValidRequiredHours,
};

export const validateUpdateDatePropertyRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { date, year, month, key, value } = unknownValuesRequestBody;

  const validDate = isValidDateNumber(date);

  if (validDate instanceof Error) return validDate;

  const validYear = isValidYearNumber(year);

  if (validYear instanceof Error) return validYear;

  const validMonth = isValidMonthNumber(month);

  if (validMonth instanceof Error) return validMonth;

  const validKeyValuePair = isValidKeyValuePair(
    key,
    value,
    keyValueTestFunctionObject,
  );

  if (validKeyValuePair instanceof Error) return validKeyValuePair;

  const validData = {
    year: validYear,
    month: validMonth,
    date: validDate,
    ...validKeyValuePair,
  };

  return validData;
};
