export const isObject = (item: unknown) =>
  typeof item === "object" && item !== null && !Array.isArray(item);
