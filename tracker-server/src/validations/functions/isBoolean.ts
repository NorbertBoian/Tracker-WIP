import { trueSendMessageErrorCause } from "../../constants";

export const isBoolean = (value: unknown) => {
  if (typeof value === "boolean") return value;
  else {
    const typeofValue =
      typeof value === "object"
        ? Object.prototype.toString.call(value).slice(8, -1).toLowerCase()
        : typeof value;
    const stringifiedValue =
      typeof value === "string" ? `'${value}'` : JSON.stringify(value);
    return new Error(
      `Supplied value: ${stringifiedValue} of type ${typeofValue}, is not of type boolean.`,
      trueSendMessageErrorCause,
    );
  }
};
