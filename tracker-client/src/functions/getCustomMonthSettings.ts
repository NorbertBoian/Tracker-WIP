import { apiSlice } from "../slices/apiSlice";
import { store } from "../store";
import { transformCustomMonthSettingsResponse } from "../utils/transformCustomMonthSettings";

export const getCustomMonthSettings = () => {
  const { year, month } = store.getState().main;
  const { data, isError } = apiSlice.endpoints.getCustomMonthSettings.select({
    month,
    year,
  })(store.getState());
  return transformCustomMonthSettingsResponse(data);
};
