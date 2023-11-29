import { isValidEmail } from "./functions/isValidEmail";
import { isValidPassword } from "./functions/isValidPassword";
import { isValidUsername } from "./functions/isValidUsername";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["email", "password", "username"] as const;

export const validateRegisterUserRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { email, password, username } = unknownValuesRequestBody;

  const validEmail = isValidEmail(email);
  if (validEmail instanceof Error) return validEmail;

  const validPassword = isValidPassword(password);
  if (validPassword instanceof Error) return validPassword;

  const validUsername = isValidUsername(username);
  if (validUsername instanceof Error) return validUsername;

  const validData = {
    email: validEmail,
    username: validUsername,
    password: validPassword,
  };

  return validData;
};
