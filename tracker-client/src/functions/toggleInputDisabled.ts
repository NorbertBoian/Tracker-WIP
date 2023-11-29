import { apiSlice } from "../slices/apiSlice";
import {
  lockedInputsToggled,
  savedStatusChanged,
} from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import { getRateLimitedFunction } from "./getRateLimitedFunction";
import { updateMonthPropertyInLocalStorage } from "./updateMonthPropertyInLocalStorage";

const setInputDisabledInLongTermStorage = async (inputDisabled: boolean) => {
  const { year, month, email } = store.getState().main;
  const { dispatch } = store;
  if (email) {
    const response = await dispatch(
      apiSlice.endpoints.updateInputDisabled.initiate({
        month,
        year,
        inputDisabled,
      }),
    );
    if ("error" in response) {
      dispatch(savedStatusChanged(false));
    } else {
      dispatch(savedStatusChanged(true));
    }
  } else {
    updateMonthPropertyInLocalStorage(
      year,
      month,
      "lockedInputs",
      inputDisabled,
    );
  }
};

const rateLimitedSetInputDisabledInLongTermStorage = getRateLimitedFunction(
  setInputDisabledInLongTermStorage,
  100,
  false,
);

export const toggleInputDisabled = () => {
  const { dispatch } = store;
  const { lockedInputs, email } = store.getState().main;
  if (lockedInputs.data !== undefined) {
    if (email) dispatch(savedStatusChanged(false));
    dispatch(lockedInputsToggled());
    rateLimitedSetInputDisabledInLongTermStorage(!lockedInputs.data);
  }
};
