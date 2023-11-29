import { englishWeekdaysArray } from "../../constants";
import { isValidDisabledDayStatus } from "./isValidDisabledDayStatus";
import { isValidHourlyRate } from "./isValidHourlyRate";
import { isValidOvertimeMultiplier } from "./isValidOvertimeMultiplier";
import { isValidRequiredHours } from "./isValidRequiredHours";
import { matchesKeyArrayExactly } from "./matchesKeyArrayExactly";
import { matchesProperties } from "./matchesProperties";

const expectedMonthSettingsObjectKeys = [
  "monthCustomHourlyRate",
  "monthCustomOvertimeMultiplier",
  "monthCustomRequiredHours",
  "monthCustomDisabledDays",
] as const;

export const isValidMonthSettingsObject = (value: unknown) => {
  const unknownValuesDateObject = matchesKeyArrayExactly(
    value,
    expectedMonthSettingsObjectKeys,
  );
  if (unknownValuesDateObject instanceof Error) return unknownValuesDateObject;

  const {
    monthCustomHourlyRate,
    monthCustomOvertimeMultiplier,
    monthCustomRequiredHours,
    monthCustomDisabledDays,
  } = unknownValuesDateObject;

  const validMonthCustomOvertimeMultiplier = isValidOvertimeMultiplier(
    monthCustomOvertimeMultiplier,
  );
  if (validMonthCustomOvertimeMultiplier instanceof Error)
    return validMonthCustomOvertimeMultiplier;

  const validMonthCustomHourlyRate = isValidHourlyRate(monthCustomHourlyRate);
  if (validMonthCustomHourlyRate instanceof Error)
    return validMonthCustomHourlyRate;

  const validMonthCustomRequiredHours = matchesProperties(
    monthCustomRequiredHours,
    englishWeekdaysArray,
    isValidRequiredHours,
  );
  if (validMonthCustomRequiredHours instanceof Error)
    return validMonthCustomRequiredHours;

  const validMonthCustomDisabledDays = matchesProperties(
    monthCustomDisabledDays,
    englishWeekdaysArray,
    isValidDisabledDayStatus,
  );
  if (validMonthCustomDisabledDays instanceof Error)
    return validMonthCustomDisabledDays;

  const validMonthSettingsObject = {
    monthCustomHourlyRate: validMonthCustomHourlyRate,
    monthCustomOvertimeMultiplier: validMonthCustomOvertimeMultiplier,
    monthCustomRequiredHours: validMonthCustomRequiredHours,
    monthCustomDisabledDays: validMonthCustomDisabledDays,
  };

  return validMonthSettingsObject;
};
