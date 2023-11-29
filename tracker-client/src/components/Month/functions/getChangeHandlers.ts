import { setDateProperty } from "../../../functions/setDateProperty";
import { datePropertyChanged } from "../../../slices/mainSlice/mainSlice";
import { store } from "../../../store";
import { IDate } from "../../../utils/getEmptyDatesArray";

let timeout: NodeJS.Timeout | undefined;
let nextTick: NodeJS.Timeout | undefined;
let prevKey: keyof IDate;
let prevDateNumber: number;

export const getChangeHandlers = (isLoggedIn: boolean) => {
  const { dispatch } = store;

  const guestGetHandleDayPropertyChange =
    <Key extends keyof IDate>(key: Key, date: number) =>
    (value: IDate[Key]) => {
      const changeDatePropertyWrapper = () =>
        dispatch(datePropertyChanged({ date, property: key, value }));
      const changeDatePropertyTick = () => {
        nextTick = undefined;
        dispatch(datePropertyChanged({ date, property: key, value }));
      };
      if (prevKey === key && prevDateNumber === date && timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(changeDatePropertyWrapper, 1);
      if (prevKey === key && prevDateNumber === date && !nextTick) {
        nextTick = setTimeout(changeDatePropertyTick, 1);
      }
      prevKey = key;
      prevDateNumber = date;
    };
  const userGetHandleDayPropertyChange = setDateProperty;

  const getHandleDayPropertyChange = isLoggedIn
    ? userGetHandleDayPropertyChange
    : guestGetHandleDayPropertyChange;

  return {
    getHandleDayPropertyChange,
  };
};
