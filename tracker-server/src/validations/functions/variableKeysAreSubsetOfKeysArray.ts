import { trueSendMessageErrorCause } from "../../constants";

export const variableKeysAreSubsetOfKeysArray = <
  Keys extends string[] | readonly string[],
>(
  value: unknown,
  keysArray: Keys,
  errorContext = "",
) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (typeof value !== "object" || value === null) {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Supplied value: ${stringifiedValue} of type ${typeofValue} is not a non null object.`,
      trueSendMessageErrorCause,
    );
  }

  const objectKeys = Object.keys(value).sort();

  if (
    objectKeys.length <= keysArray.length &&
    objectKeys.every((key) => keysArray.includes(key))
  ) {
    const unknownValuesObject = value as Partial<{
      [key in Keys[number]]: unknown;
    }>;
    return unknownValuesObject;
  } else
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Keys of supplied object: ${objectKeys.sort()} are invalid. Object keys must be a subset of  ${[
        ...keysArray,
      ].sort()}`,
      trueSendMessageErrorCause,
    );
};
