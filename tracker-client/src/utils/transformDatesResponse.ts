import { monthNumberType } from "../constants/constants";
import { getDatesResultBeforeTransform } from "../slices/apiSliceTypes";
import { getEmptyDatesArray } from "./getEmptyDatesArray";

export const transformDatesResponse = (
  response: getDatesResultBeforeTransform | string | undefined,
  meta: unknown,
  { year, month }: { year: number; month: monthNumberType },
) => {
  if (!response || typeof response === "string")
    return {
      inputDisabled: false,
      dates: getEmptyDatesArray(year, month),
    };
  else return response;
};
