import { isValidLanguageCode } from "./functions/isValidLanguageCode";
import { matchesKeyArrayExactly } from "./functions/matchesKeyArrayExactly";

const expectedRequestBodyKeys = ["languageCode"] as const;

export const validateUpdatePreferredLangaugeRequestBody = (requestBody: {
  [key: string]: unknown;
}) => {
  const unknownValuesRequestBody = matchesKeyArrayExactly(
    requestBody,
    expectedRequestBodyKeys,
  );

  if (unknownValuesRequestBody instanceof Error)
    return unknownValuesRequestBody;

  const { languageCode } = unknownValuesRequestBody;

  const validLanguageCode = isValidLanguageCode(languageCode);

  if (validLanguageCode instanceof Error) return validLanguageCode;

  const validData = {
    languageCode: validLanguageCode,
  };

  return validData;
};
