import { trueSendMessageErrorCause } from "../constants";
import { isValidInputDisabledStatus } from "./functions/isValidInputDisabledStatus";
import { isValidMonthNumber } from "./functions/isValidMonthNumber";
import { isValidYearNumber } from "./functions/isValidYearNumber";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["year", "month", "inputDisabled"] as const;

export const validateUpdateLockStatusRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { year, month, inputDisabled } = unknownValuesRequestBody;

  const validInputDisabled = isValidInputDisabledStatus(inputDisabled);

  if (validInputDisabled instanceof Error) return validInputDisabled;

  const validYear = isValidYearNumber(year);

  if (validYear instanceof Error) return validYear;

  const validMonth = isValidMonthNumber(month);

  if (validMonth instanceof Error) return validMonth;

  const validData = {
    year: validYear,
    month: validMonth,
    inputDisabled: validInputDisabled,
  };

  return validData;
};
