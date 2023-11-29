import { dateNumberType, trueSendMessageErrorCause } from "../../constants";

const requirement = "Requirement: 1 <= number <= 31" as const;

const invalidDateNumberMessage = "Invalid date number." as const;

export const isValidDateNumber = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "number") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidDateNumberMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value < 1)
    return new Error(
      `${invalidDateNumberMessage} Supplied number: ${stringifiedValue} is too low. ${requirement}`,
      trueSendMessageErrorCause,
    );

  if (value > 31)
    return new Error(
      `${invalidDateNumberMessage} Supplied number: ${stringifiedValue} is too high. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value as dateNumberType;
};
