import { getGuestCustomMonthSettings } from "../functions/getGuestCustomMonthSettings";
import { apiSlice } from "../slices/apiSlice";
import { store, useAppSelector } from "../store";

export const useMonthCustomSettings = () => {
  const monthSettings = useAppSelector((state) => state.main.monthSettings);
  const { isFetching, isSuccess } = monthSettings;
  const monthCustomSettings = getGuestCustomMonthSettings(monthSettings.data);

  return { data: monthCustomSettings, isFetching, isSuccess };
};

export const getMonthCustomSettings = async () => {
  const { monthSettings, email, year, month } = store.getState().main;
  const { dispatch } = store;

  if (email) {
    const response = await dispatch(
      apiSlice.endpoints.getCustomMonthSettings.initiate({ year, month }),
    );
    return typeof response.data !== "string" ? response.data : undefined;
  } else return getGuestCustomMonthSettings(monthSettings.data);
};
