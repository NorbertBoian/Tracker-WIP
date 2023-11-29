import { trueSendMessageErrorCause } from "../../constants";

export const isValidYearNumber = (value: unknown) => {
  const requirement = "Requirement: 1800 <= number <= 9999" as const;

  const invalidYearNumberMessage = "Invalid year number." as const;

  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "number") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidYearNumberMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value < 1800)
    return new Error(
      `${invalidYearNumberMessage} Supplied number: ${stringifiedValue} is too low. ${requirement}`,
      trueSendMessageErrorCause,
    );

  if (value > 9999)
    return new Error(
      `${invalidYearNumberMessage} Supplied number: ${stringifiedValue} is too high. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value;
};
