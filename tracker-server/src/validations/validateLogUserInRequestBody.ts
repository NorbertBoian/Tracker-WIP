import { isValidEmail } from "./functions/isValidEmail";
import { isValidPassword } from "./functions/isValidPassword";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["email", "password"] as const;

export const validateLogUserInRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { email, password } = unknownValuesRequestBody;

  const validEmail = isValidEmail(email);
  if (validEmail instanceof Error) return validEmail;

  const validPassword = isValidPassword(password);
  if (validPassword instanceof Error) return validPassword;

  const validData = {
    email: validEmail,
    password: validPassword,
  };

  return validData;
};
