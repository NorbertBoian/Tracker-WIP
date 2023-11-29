import {
  overtimeMultiplierRegex,
  overtimeMultiplierNoEmptyStringRegex,
  overtimeMultiplierTrailingDecimalPointAllowedRegex,
  trueSendMessageErrorCause,
} from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: string, whose length cannot exceed 5 characters, that matches the following RegEx: ${overtimeMultiplierRegex} .` as const;

const requirementNoEmpty =
  `Requirement: Non empty string, whose length cannot exceed 5 characters, that matches the following RegEx: ${overtimeMultiplierNoEmptyStringRegex} .` as const;

const requirementTrailingDecimalPointAllowed =
  `Requirement: string, whose length cannot exceed 5 characters, that matches the following RegEx: ${overtimeMultiplierTrailingDecimalPointAllowedRegex} .` as const;

const invalidOvertimeMultiplierMessage =
  "Invalid overtime multiplier." as const;

export const isValidOvertimeMultiplier = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirement}`,
      trueSendMessageErrorCause,
    );

  const validOvertimeMultiplier = matchesAtLeastOneRegex(value, [
    overtimeMultiplierRegex,
  ]);

  if (validOvertimeMultiplier instanceof Error)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validOvertimeMultiplier;
};

export const isValidOvertimeMultiplierNoEmptyString = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );

  const validOvertimeMultiplier = matchesAtLeastOneRegex(value, [
    overtimeMultiplierNoEmptyStringRegex,
  ]);

  if (validOvertimeMultiplier instanceof Error)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validOvertimeMultiplier;
};

export const isValidOvertimeMultiplierTrailingDecimalPointAllowed = (
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
      `${invalidOvertimeMultiplierMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );

  const validOvertimeMultiplier = matchesAtLeastOneRegex(value, [
    overtimeMultiplierTrailingDecimalPointAllowedRegex,
  ]);

  if (validOvertimeMultiplier instanceof Error)
    return new Error(
      `${invalidOvertimeMultiplierMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirementTrailingDecimalPointAllowed}`,
      trueSendMessageErrorCause,
    );

  return validOvertimeMultiplier;
};
