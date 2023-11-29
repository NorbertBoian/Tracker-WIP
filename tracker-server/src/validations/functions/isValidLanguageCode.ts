import {
  languageCodes,
  languageCodeType,
  trueSendMessageErrorCause,
} from "../../constants";

const requirement =
  `Requirement: Value must match one of the following strings: ${languageCodes.join(
    " | ",
  )} .` as const;

const invalidLanguageCode = "Invalid language code." as const;

export const isValidLanguageCode = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "string") {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidLanguageCode} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (languageCodes.find((languageCodes) => languageCodes === value))
    return value as languageCodeType;

  return new Error(
    `${invalidLanguageCode} Supplied string: ${stringifiedValue} matches neither of the available language codes. ${requirement}`,
    trueSendMessageErrorCause,
  );
};
