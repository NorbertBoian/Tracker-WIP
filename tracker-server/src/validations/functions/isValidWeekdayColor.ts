import { colorType, trueSendMessageErrorCause } from "../../constants";
import { capitalize } from "../../utils/capitalize";

const requirement =
  `Requirement: Array of three numbers, each ranging from 0 to 255 (representing Red, Green and Blue values of color).` as const;

const invalidWeekdayColor = "Invalid weekday color." as const;

export const isValidWeekdayColor = (value: unknown) => {
  const stringifiedValue =
    typeof value === "string" ? `'${value}'` : JSON.stringify(value);
  if (!Array.isArray(value)) {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    return new Error(
      `${invalidWeekdayColor} Supplied value: ${stringifiedValue} of type ${typeofValue} does not match the required type. ${requirement}`,
      trueSendMessageErrorCause,
    );
  }

  if (value.length < 3)
    return new Error(
      `${invalidWeekdayColor} Supplied array: ${stringifiedValue} of length ${value.length} is too short. ${requirement}`,
      trueSendMessageErrorCause,
    );

  if (value.length > 3)
    return new Error(
      `${invalidWeekdayColor} Supplied array: ${stringifiedValue} of length ${value.length} is too long. ${requirement}`,
      trueSendMessageErrorCause,
    );

  const weekdayColorUnknownValues = value as [unknown, unknown, unknown];
  const indexWords = ["first", "second", "third"];
  const invalidElements: string[] = [];
  if (
    weekdayColorUnknownValues.every((colorValue, index) => {
      const stringifiedColorValue =
        typeof colorValue === "string"
          ? `'${colorValue}'`
          : JSON.stringify(colorValue);
      if (typeof colorValue !== "number") {
        const typeofColorValue =
          typeof colorValue === "object"
            ? Object.prototype.toString
                .call(colorValue)
                .slice(8, -1)
                .toLowerCase()
            : typeof colorValue;
        invalidElements.push(
          `${indexWords[index]} element of the array: ${stringifiedColorValue} of type ${typeofColorValue} does not match the required type`,
        );
        return false;
      }
      if (colorValue < 0) {
        invalidElements.push(
          `${indexWords[index]} element of the array: ${stringifiedColorValue} is too low`,
        );
        return false;
      }
      if (colorValue > 255) {
        invalidElements.push(
          `${indexWords[index]} element of the array: ${stringifiedColorValue} is too high`,
        );
        return false;
      }
      return true;
    })
  ) {
    return weekdayColorUnknownValues as colorType;
  } else {
    const lastTwoInvalid = invalidElements.slice(-2).join(" and ");
    const invalidWithoutlastTwo = invalidElements.slice(0, -2).join(", ");
    const errorMessage = `${invalidWithoutlastTwo}${
      invalidWithoutlastTwo.length > 0 ? " " : ""
    }${lastTwoInvalid}. ${requirement}`;
    return new Error(capitalize(errorMessage), trueSendMessageErrorCause);
  }
};
