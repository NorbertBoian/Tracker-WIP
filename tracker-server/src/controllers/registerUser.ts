import bcrypt from "bcrypt";

import { Request, Response } from "express";
import { Knex } from "knex";
import { users } from "../constants";
import { aesEncrypt } from "../utils/aesEncrypt";
import { handleError } from "../utils/handleError";
import { validateRegisterUserRequestBody } from "../validations/validateRegisterUserRequestBody";

interface IExpectedRequestBody {
  username: string;
  password: string;
  email: string;
}

type IResponseBody = string;

const registeredSuccessfully = "Registered successfully.";

export const registerUser = async (
  req: Request<
    { [key: string]: string },
    IResponseBody,
    { [key: string]: unknown }
  >,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    const validData = validateRegisterUserRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { email, password, username } = validData;
    const userList = await db
      .select("user_id", "password", "email")
      .from("users");
    const matchingUser = userList.find((user) =>
      bcrypt.compareSync(email, user.email),
    );
    if (matchingUser === undefined) {
      const passwordSalt = await bcrypt.genSalt(11);
      const hashedPassword = await bcrypt.hash(password, passwordSalt);
      const { asciiCipherTextAndCounterString } = await aesEncrypt(username);
      const emailSalt = await bcrypt.genSalt(11);
      const hashedEmail = await bcrypt.hash(email, emailSalt);

      await db(users).insert({
        username: asciiCipherTextAndCounterString,
        password: hashedPassword,
        email: hashedEmail,
      });

      res.status(201).json(registeredSuccessfully);
    } else {
      res
        .status(400)
        .json(
          "There is already an account associated with this email address.",
        );
    }
  } catch (err) {
    handleError(err, res);
  }
};
