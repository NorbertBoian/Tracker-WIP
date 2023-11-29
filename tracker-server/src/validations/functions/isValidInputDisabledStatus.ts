import { trueSendMessageErrorCause } from "../../constants";
import { isBoolean } from "./isBoolean";

const invalidInputDisabledStatusMessage =
  "Invalid input disabled status." as const;
const requirement = "Requirement: boolean" as const;

export const isValidInputDisabledStatus = (inputDisabled: unknown) => {
  const isValidInputDisabledStatus = isBoolean(inputDisabled);

  if (isValidInputDisabledStatus instanceof Error)
    return new Error(
      `${invalidInputDisabledStatusMessage} ${isValidInputDisabledStatus.message} ${requirement}`,
      trueSendMessageErrorCause,
    );
  return isValidInputDisabledStatus;
};
