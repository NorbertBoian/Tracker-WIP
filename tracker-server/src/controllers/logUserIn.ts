import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { Knex } from "knex";
import { handleError } from "../utils/handleError";
import { validateLogUserInRequestBody } from "../validations/validateLogUserInRequestBody";

interface IExpectedRequestBody {
  email: string;
  password: string;
}

type IResponseBody = { loggedIn: true; message: string } | string;

const loggedInSuccessfully = "Logged in sucessfully.";
const logInFailed = "Log in failed.";

export const logUserIn = async (
  req: Request<
    { [key: string]: string },
    IResponseBody,
    { [key: string]: unknown }
  >,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    const validData = validateLogUserInRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { email, password } = validData;
    const users = await db.select("user_id", "password", "email").from("users");
    const matchingUser = users.find((user) =>
      bcrypt.compareSync(email, user.email),
    );
    if (matchingUser !== undefined) {
      const hashedPassword = matchingUser.password;
      const passwordIsValid = await bcrypt.compare(password, hashedPassword);
      if (passwordIsValid) {
        const userId = matchingUser.user_id;
        req.session.userId = userId;
        res.json({ loggedIn: true, message: loggedInSuccessfully });
      } else res.status(401).json(logInFailed);
    } else res.status(401).json(logInFailed);
  } catch (err) {
    handleError(err, res, logInFailed);
  }
};
