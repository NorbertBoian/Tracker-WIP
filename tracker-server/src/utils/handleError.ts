import { Response } from "express";
import { unableToUpdateDatabaseMessage } from "../constants";
import { hasResponseCodeCauseProperty } from "./hasResponseCodeCauseProperty";
import { hasTruthySendMessageCauseProperty } from "./hasTruthySendMessageCauseProperty";

export const handleError = (
  err: unknown,
  res: Response<string>,
  errorMessage: string = unableToUpdateDatabaseMessage,
) => {
  const message = hasTruthySendMessageCauseProperty(err);
  const statusCode = hasResponseCodeCauseProperty(err) ?? 400;
  if (message) {
    res.status(statusCode).json(message);
  } else {
    console.dir(err);
    res.status(statusCode).json(errorMessage);
  }
};
