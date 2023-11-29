import { getGuestDefaultMonthSettings } from "../functions/getGuestDefaultMonthSettings";
import { apiSlice } from "../slices/apiSlice";
import { store, useAppSelector } from "../store";
import { useUserMonthDefaultSettings } from "./useUserMonthDefaultSettings";

export const useMonthDefaultSettings = (refetchOnMountOrArgChange = false) => {
  const monthCreatedAt = useAppSelector((state) => state.main.monthCreatedAt);
  const applicationSettings = useAppSelector(
    (state) => state.main.applicationSettings,
  );
  const email = useAppSelector((state) => state.main.email);

  const userMonthDefaultSettings = useUserMonthDefaultSettings(
    refetchOnMountOrArgChange,
  );

  if (email) {
    return userMonthDefaultSettings;
  } else {
    return {
      data: getGuestDefaultMonthSettings(
        monthCreatedAt.data ?? Date.now(),
        applicationSettings.data,
      ),
      isFetching: false,
      isSuccess: true,
    };
  }
};

export const getMonthDefaultSettings = async () => {
  const { year, month, email, monthCreatedAt, applicationSettings } =
    store.getState().main;
  const { dispatch } = store;

  if (email) {
    let response = await dispatch(
      apiSlice.endpoints.getDefaultMonthSettings.initiate({ year, month }),
    );
    if (typeof response.data !== "string") return response.data;
    else {
      response = await dispatch(
        apiSlice.endpoints.getDefaultMonthSettings.initiate(
          { year, month },
          { forceRefetch: true },
        ),
      );
      return typeof response.data !== "string" ? response.data : undefined;
    }
  } else
    return getGuestDefaultMonthSettings(
      monthCreatedAt.data,
      applicationSettings.data,
    );
};
