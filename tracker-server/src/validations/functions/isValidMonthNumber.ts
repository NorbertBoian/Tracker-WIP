import { monthNumberType, trueSendMessageErrorCause } from "../../constants";

const requirement = "Requirement: 0 <= number <= 11" as const;

const invalidMonthNumberMessage = "Invalid month number." as const;

export const isValidMonthNumber = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "number") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidMonthNumberMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value < 0)
    return new Error(
      `${invalidMonthNumberMessage} Supplied number: ${stringifiedValue} is too low. ${requirement}`,
      trueSendMessageErrorCause,
    );

  if (value > 11)
    return new Error(
      `${invalidMonthNumberMessage} Supplied number: ${stringifiedValue} is too high. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value as monthNumberType;
};
