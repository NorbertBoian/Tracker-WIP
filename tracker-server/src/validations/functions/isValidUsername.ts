import { trueSendMessageErrorCause } from "../../constants";

const requirement =
  `Requirement: non empty string with a maximum length of 8.` as const;

const invalidUsernameMessage = "Invalid username." as const;

export const isValidUsername = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidUsernameMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value === "")
    return new Error(
      `${invalidUsernameMessage} Supplied string is empty. ${requirement}`,
      trueSendMessageErrorCause,
    );

  if (value.length > 8)
    return new Error(
      `${invalidUsernameMessage} Supplied string exceeds 8 character limit. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return value;
};
