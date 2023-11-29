import { COOKIE_NAME } from "../constants";
import { Request, Response } from "express";
import { handleError } from "../utils/handleError";

type IResponseBody = { loggedIn: false; message: string } | string;

const couldntLogOut = "Couldn't log out.";
const logoutSuccesfull = "Logout successful.";

export const logUserOut = async (
  req: Request<{ [key: string]: string }, IResponseBody, Record<string, never>>,
  res: Response<IResponseBody>,
) => {
  try {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          res.status(400).json(couldntLogOut);
        } else {
          res.clearCookie(COOKIE_NAME);
          res.json({ loggedIn: false, message: logoutSuccesfull });
        }
      });
    } else {
      res.status(400).json(couldntLogOut);
    }
  } catch (err) {
    handleError(err, res, couldntLogOut);
  }
};
