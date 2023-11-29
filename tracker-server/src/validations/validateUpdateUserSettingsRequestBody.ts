import { englishWeekdaysArray } from "../constants";
import { isBoolean } from "./functions/isBoolean";
import { isValidAutosaveInterval } from "./functions/isValidAutosaveInterval";
import { isValidDisabledDayStatus } from "./functions/isValidDisabledDayStatus";
import { isValidDisplayedCurrency } from "./functions/isValidDisplayedCurrency";
import { isValidHourlyRateNoEmptyString } from "./functions/isValidHourlyRate";
import { isValidLanguageCode } from "./functions/isValidLanguageCode";
import { isValidOvertimeMultiplierNoEmptyString } from "./functions/isValidOvertimeMultiplier";
import { isValidRequiredHoursNoEmptyString } from "./functions/isValidRequiredHours";
import { isValidWeekdayColor } from "./functions/isValidWeekdayColor";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";
import { matchesProperties } from "./functions/matchesProperties";

const expectedRequestBodyKeys = [
  "userDefaultHourlyRate",
  "userDefaultOvertimeMultiplier",
  "userDefaultRequiredHours",
  "userDefaultDisabledDays",
  "userDefaultDaysColors",
  "languageCode",
  "autosaveInterval",
  "displayedCurrency",
] as const;

export const validateUpdateUserSettingsRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const {
    userDefaultHourlyRate,
    userDefaultOvertimeMultiplier,
    userDefaultRequiredHours,
    userDefaultDisabledDays,
    userDefaultDaysColors,
    languageCode,
    autosaveInterval,
    displayedCurrency,
  } = unknownValuesRequestBody;

  const validUserDefaultHourlyRate = isValidHourlyRateNoEmptyString(
    userDefaultHourlyRate,
  );

  if (validUserDefaultHourlyRate instanceof Error)
    return validUserDefaultHourlyRate;

  const validUserDefaultOvertimeMultiplier =
    isValidOvertimeMultiplierNoEmptyString(userDefaultOvertimeMultiplier);

  if (validUserDefaultOvertimeMultiplier instanceof Error)
    return validUserDefaultOvertimeMultiplier;

  const validUserDefaultRequiredHours = matchesProperties(
    userDefaultRequiredHours,
    englishWeekdaysArray,
    isValidRequiredHoursNoEmptyString,
    false,
    "Invalid userDefaultRequiredHours.",
  );

  if (validUserDefaultRequiredHours instanceof Error)
    return validUserDefaultRequiredHours;

  const validUserDefaultDisabledDays = matchesProperties(
    userDefaultDisabledDays,
    englishWeekdaysArray,
    isValidDisabledDayStatus,
    false,
    "Invalid userDefaultDisabledDays.",
  );

  if (validUserDefaultDisabledDays instanceof Error)
    return validUserDefaultDisabledDays;

  const validUserDefaultDaysColors = matchesProperties(
    userDefaultDaysColors,
    englishWeekdaysArray,
    isValidWeekdayColor,
    true,
    "Invalid userDefaultDaysColors.",
  );

  if (validUserDefaultDaysColors instanceof Error)
    return validUserDefaultDaysColors;

  const validLanguageCode = isValidLanguageCode(languageCode);

  if (validLanguageCode instanceof Error) return validLanguageCode;

  const validAutosaveInterval = isValidAutosaveInterval(autosaveInterval);

  if (validAutosaveInterval instanceof Error) return validAutosaveInterval;

  const validDisplayedCurrency = isValidDisplayedCurrency(displayedCurrency);

  if (validDisplayedCurrency instanceof Error) return validDisplayedCurrency;

  const validData = {
    userDefaultHourlyRate: validUserDefaultHourlyRate,
    userDefaultOvertimeMultiplier: validUserDefaultOvertimeMultiplier,
    userDefaultRequiredHours: validUserDefaultRequiredHours,
    userDefaultDisabledDays: validUserDefaultDisabledDays,
    userDefaultDaysColors: validUserDefaultDaysColors,
    languageCode: validLanguageCode,
    autosaveInterval: validAutosaveInterval,
    displayedCurrency: validDisplayedCurrency,
  };

  return validData;
};
