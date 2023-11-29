import { Request, Response } from "express";
import { Knex } from "knex";
import {
  notLoggedInMessage,
  trueSendMessageErrorCause,
  users_settings,
} from "../constants";
import { handleError } from "../utils/handleError";

type IResponseBody = boolean | string;

const errorGettingOnboardingStatus = "Couldn't get onboarding status.";

export const onboardingStatus = async (
  req: Request<{ [key: string]: string }, IResponseBody, Record<string, never>>,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    const { userId } = req.session;
    if (!userId)
      throw new Error(notLoggedInMessage, {
        cause: { sendMessage: true, responseCode: 401 },
      });

    const userSettingsResponse = await db(users_settings).where({
      user_id: userId,
    });

    if (userSettingsResponse.length > 0) res.json(true);
    else res.json(false);
  } catch (err) {
    handleError(err, res, errorGettingOnboardingStatus);
  }
};
