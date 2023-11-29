import { trueSendMessageErrorCause } from "../../constants";

export const isValidKeyValuePair = <
  O extends { [key: string]: (value: unknown) => unknown | Error },
>(
  key: unknown,
  value: unknown,
  keyValueTestFunctionObject: O,
) => {
  const stringifiedKey =
    typeof key === "string" ? `'${key}'` : JSON.stringify(key);
  if (typeof key !== "string") {
    const typeofKey =
      typeof key === "object"
        ? Object.prototype.toString.call(key).slice(8, -1).toLowerCase()
        : typeof key;
    return new Error(
      `Supplied key: ${stringifiedKey} of type ${typeofKey} is not a string`,
      trueSendMessageErrorCause,
    );
  }
  const validKeys = Object.keys(keyValueTestFunctionObject);
  if (!validKeys.includes(key))
    return new Error(
      `Supplied key ${stringifiedKey} doesn't match any property`,
      trueSendMessageErrorCause,
    );
  const validKey = key as keyof O;
  const validValue = keyValueTestFunctionObject[validKey](value) as ReturnType<
    O[keyof O]
  >;
  if (validValue instanceof Error) return validValue;
  const validKeyValuePair = { key: validKey, value: validValue } as {
    [Key in keyof O]: { key: Key; value: Exclude<ReturnType<O[Key]>, Error> };
  }[keyof O];
  return validKeyValuePair;
};
