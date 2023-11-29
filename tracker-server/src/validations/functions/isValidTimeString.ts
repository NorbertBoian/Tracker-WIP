import { timeRegex, trueSendMessageErrorCause } from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: Non empty string, whose length cannot exceed 5 characters, that matches the following RegEx: ${timeRegex} .` as const;

const invalidTimeString = "Invalid time string." as const;

export const isValidTimeString = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidTimeString} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  const validTimeString = matchesAtLeastOneRegex(value, timeRegex);

  if (validTimeString instanceof Error)
    return new Error(
      `${invalidTimeString} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validTimeString;
};

export const isValidBeganString = (value: unknown) => {
  const validBeganString = isValidTimeString(value);
  if (validBeganString instanceof Error)
    return new Error(
      `beganString: ${validBeganString.message}`,
      trueSendMessageErrorCause,
    );
  return validBeganString;
};

export const isValidEndedString = (value: unknown) => {
  const validEndedString = isValidTimeString(value);
  if (validEndedString instanceof Error)
    return new Error(
      `endedString: ${validEndedString.message}`,
      trueSendMessageErrorCause,
    );
  return validEndedString;
};
