export const hasTruthySendMessageCauseProperty = (value: unknown) => {
  if (!(value instanceof Error)) return false;
  const { cause } = value;

  if (!("message" in value)) return false;

  if (typeof cause !== "object" || cause === null) return false;

  if (!("sendMessage" in cause)) return false;
  const castedCause = cause as {
    sendMessage: unknown;
    [key: string]: unknown;
  };

  if (!castedCause.sendMessage) return false;

  return value.message;
};
