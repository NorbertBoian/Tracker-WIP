export const hasResponseCodeCauseProperty = (value: unknown) => {
  if (!(value instanceof Error)) return undefined;
  const { cause } = value;

  if (typeof cause !== "object" || cause === null) return undefined;

  if (!("responseCode" in cause)) return undefined;
  const castedCause = cause as {
    responseCode: unknown;
    [key: string]: unknown;
  };

  if (!castedCause.responseCode || typeof castedCause.responseCode !== "number")
    return undefined;

  return castedCause.responseCode;
};
