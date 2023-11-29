import { languageCodeType } from "../constants/constants";
import { apiSlice } from "../slices/apiSlice";
import {
  languageCodeChanged,
  savedStatusChanged,
} from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import { setLocalStorageItem } from "../utils/typedLocalStorage/typedLocalStorage";
import { getRateLimitedFunction } from "./getRateLimitedFunction";

const setLanguageInLongTermStorage = async (languageCode: languageCodeType) => {
  const { email } = store.getState().main;
  const { dispatch } = store;
  if (email) {
    const response = await dispatch(
      apiSlice.endpoints.updatePreferredLanguage.initiate(languageCode),
    );
    if ("error" in response) {
      dispatch(savedStatusChanged(false));
    } else {
      dispatch(savedStatusChanged(true));
    }
  } else {
    setLocalStorageItem("preferredLanguageCode", languageCode);
  }
};

const rateLimitedsetLanguageInLongTermStorage = getRateLimitedFunction(
  setLanguageInLongTermStorage,
  100,
  false,
);

export const setLanguage = (languageCode: languageCodeType) => {
  const { dispatch } = store;
  const { email } = store.getState().main;
  if (email) dispatch(savedStatusChanged(false));
  dispatch(languageCodeChanged(languageCode));
  rateLimitedsetLanguageInLongTermStorage(languageCode);
};
