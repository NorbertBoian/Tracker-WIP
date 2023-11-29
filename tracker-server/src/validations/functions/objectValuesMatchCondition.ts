import { trueSendMessageErrorCause } from "../../constants";

export const objectValuesMatchCondition = <
  O extends { [key: string]: unknown },
  T,
>(
  object: O,
  testFunction: (objectValue: unknown) => T | Error,
  errorContext = "",
) => {
  const objectEntries = Object.entries(object);
  const invalidValues: string[] = [];
  if (
    objectEntries.every((objectEntry) => {
      const validValue = testFunction(objectEntry[1]);
      if (!(validValue instanceof Error)) {
        return true;
      } else {
        invalidValues.push(
          `Invalid value for ${objectEntry[0]} object property. ${validValue.message}`,
        );
        return false;
      }
    })
  ) {
    return object as { [key in keyof O]: T };
  } else
    return new Error(
      `${errorContext}${errorContext.length > 0 ? " " : ""}${invalidValues.join(
        "\n",
      )}`,
      trueSendMessageErrorCause,
    );
};
