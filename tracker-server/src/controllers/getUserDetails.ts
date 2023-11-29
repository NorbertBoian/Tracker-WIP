import { Request, Response } from "express";
import { Knex } from "knex";
import {
  email,
  notLoggedInMessage,
  trueSendMessageErrorCause,
  username,
  users,
} from "../constants";
import { aesDecrypt } from "../utils/aesDecrypt";
import { handleError } from "../utils/handleError";

type IResponseBody =
  | {
      username: string;
    }
  | string;

const couldntFindUser = "Couldn't find user.";
const couldntGetUserDetails = "Couldn't get user details";

export const getUserDetails = async (
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

    const response = await db(users)
      .where({ user_id: userId })
      .select(username, email);

    if (response[0] !== undefined) {
      const { username: asciiCipherTextAndCounterString, email } = response[0];
      const username = await aesDecrypt(asciiCipherTextAndCounterString);
      const details = { username, email };
      res.json(details);
    } else res.status(404).json(couldntFindUser);
  } catch (err) {
    handleError(err, res, couldntGetUserDetails);
  }
};
