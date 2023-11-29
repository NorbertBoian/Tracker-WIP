import {
  datesChanged,
  savedStatusChanged,
} from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import { Dates, IDate } from "../utils/getEmptyDatesArray";
import { getRateLimitedFunction } from "./getRateLimitedFunction";
import { saveDatesInLongTermStorage } from "./saveDatesInLongTermStorage";

const rateLimitedChangeDatesInLongTermStorage = getRateLimitedFunction(
  saveDatesInLongTermStorage,
  100,
);

export const clearInputs = () => {
  const { dispatch } = store;
  const { dates, email } = store.getState().main;
  if (dates.data) {
    const presentDatesWithoutNoughthDay = dates.data.slice(1) as IDate[];
    const clearedDatesWithoutNoughthDay = presentDatesWithoutNoughthDay.map(
      (date) => {
        return { ...date, beganString: "", endedString: "" };
      },
    );
    const clearedDates: Dates = [{}, ...clearedDatesWithoutNoughthDay];
    {
      if (email) dispatch(savedStatusChanged(false));
      dispatch(
        datesChanged({
          dates: { data: clearedDates, isFetching: false, isSuccess: true },
          updateMonthComponentState: ["keepHistory"],
        }),
      );
      rateLimitedChangeDatesInLongTermStorage(clearedDates);
    }
  }
};
