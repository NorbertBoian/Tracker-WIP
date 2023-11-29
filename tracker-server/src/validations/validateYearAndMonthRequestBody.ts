import { isValidMonthNumber } from "./functions/isValidMonthNumber";
import { isValidYearNumber } from "./functions/isValidYearNumber";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["year", "month"] as const;

export const validateYearAndMonthRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { year, month } = unknownValuesRequestBody;

  const validYear = isValidYearNumber(year);
  if (validYear instanceof Error) return validYear;

  const validMonth = isValidMonthNumber(month);
  if (validMonth instanceof Error) return validMonth;

  const validData = {
    year: validYear,
    month: validMonth,
  };

  return validData;
};
