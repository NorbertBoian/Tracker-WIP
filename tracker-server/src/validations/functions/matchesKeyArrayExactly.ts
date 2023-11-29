import { trueSendMessageErrorCause } from "../../constants";

export const matchesKeyArrayExactly = <
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

  const sortedObjectKeys = Object.keys(value).sort();
  const mutableKeysArray = [...keysArray];
  const sortedKeysArray = mutableKeysArray.sort();

  if (
    sortedObjectKeys.length === sortedKeysArray.length &&
    sortedObjectKeys.every((key, index) => key === sortedKeysArray[index])
  ) {
    const unknownValuesObject = value as { [key in Keys[number]]: unknown };
    return unknownValuesObject;
  } else
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Keys of supplied object: ${sortedObjectKeys} do not perfectly match the required ones. Object keys must be exactly ${sortedKeysArray}`,
      trueSendMessageErrorCause,
    );
};
