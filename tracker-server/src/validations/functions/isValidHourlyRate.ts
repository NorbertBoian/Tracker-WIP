import {
  hourlyRateNoEmptyStringRegex,
  hourlyRateRegex,
  hourlyRateTrailingDecimalPointAllowedRegex,
  trueSendMessageErrorCause,
} from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: string, whose length cannot exceed 6 characters, that matches the following RegEx: ${hourlyRateRegex} .` as const;

const requirementNoEmpty =
  `Requirement: Non empty string, whose length cannot exceed 6 characters, that matches the following RegEx: ${hourlyRateNoEmptyStringRegex} .` as const;

const requirementTrailingDecimalPointAllowed =
  `Requirement: string, whose length cannot exceed 6 characters, that matches the following RegEx: ${hourlyRateTrailingDecimalPointAllowedRegex} .` as const;

const invalidHourlyRateMessage = "Invalid hourly rate." as const;

export const isValidHourlyRate = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidHourlyRateMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 6)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirement}`,
      trueSendMessageErrorCause,
    );

  const validHourlyRate = matchesAtLeastOneRegex(value, [hourlyRateRegex]);

  if (validHourlyRate instanceof Error)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validHourlyRate;
};

export const isValidHourlyRateNoEmptyString = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidHourlyRateMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 6)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );

  const validHourlyRate = matchesAtLeastOneRegex(value, [
    hourlyRateNoEmptyStringRegex,
  ]);

  if (validHourlyRate instanceof Error)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );

  return validHourlyRate;
};

export const isValidHourlyRateTrailingDecimalPointAllowed = (
  value: unknown,
) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidHourlyRateMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 6)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );

  const validHourlyRate = matchesAtLeastOneRegex(value, [
    hourlyRateTrailingDecimalPointAllowedRegex,
  ]);

  if (validHourlyRate instanceof Error)
    return new Error(
      `${invalidHourlyRateMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );

  return validHourlyRate;
};
