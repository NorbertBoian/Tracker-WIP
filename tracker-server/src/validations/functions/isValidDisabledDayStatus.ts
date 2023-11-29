import { trueSendMessageErrorCause } from "../../constants";
import { isBoolean } from "./isBoolean";

const invalidDisabledDayStatusMessage = "Invalid disabled day status." as const;
const requirement = "Requirement: boolean" as const;

export const isValidDisabledDayStatus = (inputDisabled: unknown) => {
  const validDisabledDayStatus = isBoolean(inputDisabled);

  if (validDisabledDayStatus instanceof Error)
    return new Error(
      `${invalidDisabledDayStatusMessage} ${validDisabledDayStatus.message} ${requirement}`,
      trueSendMessageErrorCause,
    );
  return validDisabledDayStatus;
};
