import { trueSendMessageErrorCause } from "../../constants";

export const matchesLengthAndValues = <T>(
  value: unknown,
  length: number | [number, number],
  testFunction: (element: unknown) => T | Error,
  errorContext = "",
) => {
  const lengthRange = Array.isArray(length) ? length : [0, length];
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (!Array.isArray(value)) {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Supplied value: ${stringifiedValue} of type ${typeofValue} is not an array.`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length < lengthRange[0]) {
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Supplied array of length ${value.length} is too short.`,
      // `${errorContext}${
      //   errorContext.length > 0 ? " " : ""
      // }Supplied array: ${stringifiedValue} of length ${
      //   value.length
      // } is too short.`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length > lengthRange[1]) {
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }Supplied array of length ${value.length} is too long.`,
      // `${errorContext}${
      //   errorContext.length > 0 ? " " : ""
      // }Supplied array: ${stringifiedValue} of length ${
      //   value.length
      // } is too long.`,
      trueSendMessageErrorCause,
    );
  }

  const invalidElements: string[] = [];

  if (
    value.every((element, index) => {
      const validElement = testFunction(element);
      if (!(validElement instanceof Error)) {
        return true;
      } else {
        invalidElements.push(
          `Invalid array element at index ${index}. ${validElement.message}`,
        );
        return false;
      }
    })
  ) {
    return value as T[];
  } else {
    return new Error(
      `${errorContext}${
        errorContext.length > 0 ? " " : ""
      }${invalidElements.join("\n")}`,
      trueSendMessageErrorCause,
    );
  }
};
