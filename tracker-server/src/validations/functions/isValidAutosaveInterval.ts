import { trueSendMessageErrorCause } from "../../constants";

const requirement =
  "Requirement: number >= 15 (representing number of seconds)" as const;

const invalidAutosaveIntervalMessage = "Invalid autosave interval." as const;

export const isValidAutosaveInterval = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "number") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidAutosaveIntervalMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value < 15)
    return new Error(
      `${invalidAutosaveIntervalMessage} Supplied number: ${stringifiedValue} is too low. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value;
};
