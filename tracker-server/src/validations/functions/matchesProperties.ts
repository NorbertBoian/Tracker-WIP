import { matchesKeyArrayExactly } from "./matchesKeyArrayExactly";
import { objectValuesMatchCondition } from "./objectValuesMatchCondition";
import { variableKeysAreSubsetOfKeysArray } from "./variableKeysAreSubsetOfKeysArray";

type matchesPropertiesOverload = {
  <Keys extends string[] | readonly string[], T>(
    value: unknown,
    keysArray: Keys,
    testFunction: (objectValue: unknown) => T | Error,
    allowPartial: true,
    errorContext?: string,
  ): Error | { [key in keyof Partial<{ [key in Keys[number]]: unknown }>]: T };
  <Keys extends string[] | readonly string[], T>(
    value: unknown,
    keysArray: Keys,
    testFunction: (objectValue: unknown) => T | Error,
    allowPartial?: false,
    errorContext?: string,
  ): Error | { [key in keyof { [key in Keys[number]]: unknown }]: T };
};

export const matchesProperties: matchesPropertiesOverload = <
  Keys extends string[] | readonly string[],
  T,
>(
  value: unknown,
  keysArray: Keys,
  testFunction: (objectValue: unknown) => T | Error,
  allowPartial?: boolean,
  errorContext = "",
) => {
  const matchesKeysArrayExactlyResult = matchesKeyArrayExactly(
    value,
    keysArray,
    errorContext,
  );
  const variableKeysAreSubsetOfKeysArrayResult =
    variableKeysAreSubsetOfKeysArray(value, keysArray, errorContext);
  const unknownValuesObject = allowPartial
    ? variableKeysAreSubsetOfKeysArrayResult
    : matchesKeysArrayExactlyResult;
  if (unknownValuesObject instanceof Error) return unknownValuesObject;
  const validObject = objectValuesMatchCondition(
    unknownValuesObject,
    testFunction,
    errorContext,
  );
  return validObject;
};
