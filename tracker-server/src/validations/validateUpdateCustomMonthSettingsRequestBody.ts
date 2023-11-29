import { trueSendMessageErrorCause } from "../constants";
import { isValidMonthNumber } from "./functions/isValidMonthNumber";
import { isValidMonthSettingsObject } from "./functions/isValidMonthSettingsObject";
import { isValidYearNumber } from "./functions/isValidYearNumber";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = [
  "year",
  "month",
  "customMonthSettings",
] as const;

const invalidCustomMonthSettings = "Invalid custom month settings.";

export const validateUpdateCustomMonthSettingsRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;
  const { year, month, customMonthSettings } = unknownValuesRequestBody;

  const validCustomMonthSettings =
    isValidMonthSettingsObject(customMonthSettings);

  if (validCustomMonthSettings instanceof Error)
    return new Error(
      `${invalidCustomMonthSettings} ${validCustomMonthSettings.message}`,
      trueSendMessageErrorCause,
    );

  const validYear = isValidYearNumber(year);

  if (validYear instanceof Error) return validYear;

  const validMonth = isValidMonthNumber(month);

  if (validMonth instanceof Error) return validMonth;

  const validData = {
    year: validYear,
    month: validMonth,
    customMonthSettings: validCustomMonthSettings,
  };

  return validData;
};
