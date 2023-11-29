import { trueSendMessageErrorCause } from "../../constants";

export const matchesAtLeastOneRegex = (
  value: unknown,
  regEx: RegExp | RegExp[],
) => {
  const regExArray = Array.isArray(regEx) ? regEx : [regEx];
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `Supplied value: ${stringifiedValue} of type ${typeofValue} is not a string.`,
      trueSendMessageErrorCause,
    );
  }
  if (regExArray.some((regEx) => regEx.test(value))) {
    return value;
  } else
    return new Error(
      `Supplied string ${value}, matches neither of the required RegExes. Requirement: match at least one of the following RegExes: ${regExArray.join(
        " OR ",
      )} .`,
    );
};
