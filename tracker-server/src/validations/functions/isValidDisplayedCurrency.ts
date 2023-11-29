import {
  displayedCurrencyRegex,
  trueSendMessageErrorCause,
} from "../../constants";
import { matchesAtLeastOneRegex } from "./matchesAtLeastOneRegex";

const requirement =
  `Requirement: Non empty string, whose length cannot exceed 5 characters, that matches the following RegEx: ${displayedCurrencyRegex} .` as const;

const invalidDisplayedCurrencyMessage = "Invalid displayed currency." as const;

export const isValidDisplayedCurrency = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidDisplayedCurrencyMessage} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > 5)
    return new Error(
      `${invalidDisplayedCurrencyMessage} Supplied string: ${stringifiedValue} of length ${value.length} is too long. ${requirement}`,
      trueSendMessageErrorCause,
    );

  const validDisplayedCurrency = matchesAtLeastOneRegex(
    value,
    displayedCurrencyRegex,
  );

  if (validDisplayedCurrency instanceof Error)
    return new Error(
      `${invalidDisplayedCurrencyMessage} Supplied string: ${stringifiedValue} does not match the required RegEx. ${requirement}`,
      trueSendMessageErrorCause,
    );

  return validDisplayedCurrency;
};
