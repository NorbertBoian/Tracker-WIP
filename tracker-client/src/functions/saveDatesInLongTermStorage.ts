import { apiSlice } from "../slices/apiSlice";
import { savedStatusChanged } from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import { Dates } from "../utils/getEmptyDatesArray";
import { getCreateNotification } from "./createNotification/createNotification";
import { updateMonthPropertyInLocalStorage } from "./updateMonthPropertyInLocalStorage";

const createFailNotification = getCreateNotification(
  "Failed to save inputs data.",
);

const createSuccessNotification = getCreateNotification("Saved inputs data.");

export const saveDatesInLongTermStorage = async (
  dates: Dates,
  notification = false,
) => {
  const { year, month, email, lockedInputs } = store.getState().main;
  if (lockedInputs.data !== undefined) {
    const { dispatch } = store;
    if (email) {
      const response = await dispatch(
        apiSlice.endpoints.updateDates.initiate({
          dates: dates.slice(1).map((dateObject) => ({
            ...dateObject,
            date: new Date(dateObject.date).getUTCDate(),
          })),
          month,
          year,
          inputDisabled: lockedInputs.data,
        }),
      );
      if ("error" in response) {
        if (notification) createFailNotification();
        dispatch(savedStatusChanged(false));
      } else {
        if (notification) createSuccessNotification();
        dispatch(savedStatusChanged(true));
      }
    } else {
      updateMonthPropertyInLocalStorage(year, month, "dates", dates);
    }
  }
};
