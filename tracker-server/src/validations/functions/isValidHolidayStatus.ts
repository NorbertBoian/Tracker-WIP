import { trueSendMessageErrorCause } from "../../constants";
import { isBoolean } from "./isBoolean";

const invalidHolidayStatusMessage = "Invalid holiday status." as const;
const requirement = "Requirement: boolean" as const;

export const isValidHolidayStatus = (isHoliday: unknown) => {
  const validIsHoliday = isBoolean(isHoliday);

  if (validIsHoliday instanceof Error)
    return new Error(
      `${invalidHolidayStatusMessage} ${validIsHoliday.message} ${requirement}`,
      trueSendMessageErrorCause,
    );
  return validIsHoliday;
};
