import { monthNumberType } from "../constants/constants";
import { apiSlice } from "../slices/apiSlice";
import { store } from "../store";
import { transformDefaultMonthSettings } from "../utils/transformDefaultMonthSettings";

export const getDefaultMonthSettings = (
  year: number,
  month: monthNumberType,
) => {
  const { data, isError } = apiSlice.endpoints.getDefaultMonthSettings.select({
    month,
    year,
  })(store.getState());
  return transformDefaultMonthSettings(!isError && data ? data : undefined);
};
