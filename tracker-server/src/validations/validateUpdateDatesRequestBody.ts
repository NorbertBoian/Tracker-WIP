import { isValidDateObject } from "./functions/isValidDateObject";
import { isValidInputDisabledStatus } from "./functions/isValidInputDisabledStatus";
import { isValidMonthNumber } from "./functions/isValidMonthNumber";
import { isValidYearNumber } from "./functions/isValidYearNumber";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";
import { matchesLengthAndValues } from "./functions/matchesLengthAndValues";

const expectedRequestBodyKeys = [
  "year",
  "month",
  "dates",
  "inputDisabled",
] as const;

export const validateUpdateDatesRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;
  const { year, month, inputDisabled, dates } = unknownValuesRequestBody;

  const validDates = matchesLengthAndValues(
    dates,
    [28, 31],
    isValidDateObject,
    "Invalid dates.",
  );

  if (validDates instanceof Error) return validDates;

  const validInputDisabled = isValidInputDisabledStatus(inputDisabled);

  if (validInputDisabled instanceof Error) return validInputDisabled;

  const validYear = isValidYearNumber(year);

  if (validYear instanceof Error) return validYear;

  const validMonth = isValidMonthNumber(month);

  if (validMonth instanceof Error) return validMonth;

  const validData = {
    year: validYear,
    month: validMonth,
    dates: validDates,
    inputDisabled: validInputDisabled,
  };

  return validData;
};
