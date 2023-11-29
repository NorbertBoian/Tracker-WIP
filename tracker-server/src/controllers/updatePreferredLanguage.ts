import { Request, Response } from "express";
import { Knex } from "knex";
import {
  languageCodeType,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
  users_settings,
} from "../constants";
import { handleError } from "../utils/handleError";
import { validateUpdatePreferredLangaugeRequestBody } from "../validations/validateUpdatePreferredLangaugeRequestBody";

interface IExpectedRequestBody {
  languageCode: languageCodeType;
}

type IResponseBody = string;

const successfullyUpdatedPreferredLanguageMessage =
  `${successfullyUpdated} preferred language.` as const;

export const updatePreferredLanguage = async (
  req: Request<
    { [key: string]: string },
    IResponseBody,
    { [key: string]: unknown }
  >,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    const { userId } = req.session;
    if (!userId)
      throw new Error(notLoggedInMessage, {
        cause: { sendMessage: true, responseCode: 401 },
      });

    const validData = validateUpdatePreferredLangaugeRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { languageCode } = validData;

    await db(users_settings).where({ user_id: userId }).update({
      language_code: languageCode,
    });

    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
};
