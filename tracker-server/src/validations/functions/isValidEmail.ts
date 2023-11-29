import { html5EmailRegex, trueSendMessageErrorCause } from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: string that matches the following RegEx: ${html5EmailRegex} .` as const;

const invalidEmailMessage = "Invalid email." as const;

export const isValidEmail = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidEmailMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  const validEmail = matchesAtLeastOneRegex(
    value.toLowerCase(),
    html5EmailRegex,
  );

  if (validEmail instanceof Error)
    return new Error(
      `${invalidEmailMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validEmail;
};
