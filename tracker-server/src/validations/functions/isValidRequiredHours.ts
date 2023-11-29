import {
  requiredHoursNoEmptyStringRegex,
  requiredHoursRegex,
  trueSendMessageErrorCause,
} from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: string that matches the following RegEx: ${requiredHoursRegex} .` as const;

const requirementNoEmpty =
  `Requirement: Non empty string that matches the following RegEx: ${requiredHoursNoEmptyStringRegex} .` as const;

const invalidRequiredHoursMessage = "Invalid required hours." as const;

export const isValidRequiredHours = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;

    return new Error(
      `${invalidRequiredHoursMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidRequiredHoursMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirement}`,
      trueSendMessageErrorCause,
    );

  const validRequiredHours = matchesAtLeastOneRegex(value, requiredHoursRegex);

  if (validRequiredHours instanceof Error)
    return new Error(
      `${invalidRequiredHoursMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validRequiredHours;
};

export const isValidRequiredHoursNoEmptyString = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;

    return new Error(
      `${invalidRequiredHoursMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidRequiredHoursMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );

  const validRequiredHours = matchesAtLeastOneRegex(
    value,
    requiredHoursNoEmptyStringRegex,
  );

  if (validRequiredHours instanceof Error)
    return new Error(
      `${invalidRequiredHoursMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirementNoEmpty}`,
      trueSendMessageErrorCause,
    );

  return validRequiredHours;
};
