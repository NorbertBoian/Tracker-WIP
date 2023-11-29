import { trueSendMessageErrorCause } from "../../constants";

const requirement = `Requirement: 8 characters long string.` as const;

const invalidPasswordMessage = "Invalid password." as const;

export const isValidPassword = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidPasswordMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length < 8)
    return new Error(
      `${invalidPasswordMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too short. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value;
};
