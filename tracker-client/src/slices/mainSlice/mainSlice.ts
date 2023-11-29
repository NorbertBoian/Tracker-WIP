import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { languageCodeType, monthNumberType } from "../../constants/constants";
import { WritableDraft } from "immer/src/types/types-external";
import { getLocalStorageItem } from "../../utils/typedLocalStorage/typedLocalStorage";
import {
  clientPreferredLanguage,
  getMainSliceInitialState,
} from "./functions/getMainSliceInitialState";
import { getApplicationSettingsInitialState } from "./functions/getApplicationSettingsInitialState";
import { getLocalStorageMonthData } from "../../functions/getLocalStorageMonthData";
import { languageObject as en, languageObjectType } from "../../languages/en";
import { emptyStringsLanguageObject } from "../../languages/emptyStrings";

const initialState = getMainSliceInitialState();

export const languageChanged = createAsyncThunk<
  {
    languageCode?: languageCodeType;
    languageObject: languageObjectType;
  },
  languageCodeType | undefined
>("main/languageChanged", async (languageCode, { dispatch }) => {
  if (languageCode) {
    try {
      dispatch(languageObjectisFetching());
      const { languageObject } = await import(
        `../../languages/${languageCode}.ts`
      );
      return { languageCode, languageObject };
    } catch {
      return { languageCode: "en", languageObject: en };
    }
  } else {
    return { languageObject: emptyStringsLanguageObject };
  }
});

export const mainSlice = createSlice({
  name: "main",
  initialState,
  reducers: {
    yearOrMonthChanged: (
      state,
      action: PayloadAction<{
        year?: typeof initialState.year;
        month?: typeof initialState.month;
      }>,
    ) => {
      const { year, month } = action.payload;
      if (year) state.year = year;
      if (month !== undefined) state.month = month;
      if (!state.email) {
        const {
          dates: newDates,
          lockedInputs: newLockedInputs,
          monthSettings: newMonthSettings,
          createdAt: newMonthCreatedAt,
        } = getLocalStorageMonthData(state.year, state.month);
        state.lockedInputs = {
          data: newLockedInputs,
          isFetching: false,
          isSuccess: true,
        };
        state.monthSettings = {
          data: newMonthSettings,
          isFetching: false,
          isSuccess: true,
        };
        state.monthCreatedAt = {
          data: newMonthCreatedAt,
          isFetching: false,
          isSuccess: true,
        };
        state.dates = {
          data: newDates,
          isFetching: false,
          isSuccess: true,
        };
        state.updateMonthComponentState = [];
      }
    },
    datePropertyChanged: <
      Key extends keyof Exclude<
        typeof initialState.dates.data,
        undefined
      >[number],
    >(
      state: WritableDraft<typeof initialState>,
      action: PayloadAction<{
        date: number;
        property: Key;
        value: Exclude<typeof initialState.dates.data, undefined>[number][Key];
      }>,
    ) => {
      const { date, property, value } = action.payload;
      if (state.dates.data) {
        state.dates.data[date][property] = value;
        state.dates.isFetching = false;
        state.dates.isSuccess = true;
      }
    },
    lockedInputsToggled: (state) => {
      if (state.lockedInputs.data !== undefined) {
        state.lockedInputs.data = !state.lockedInputs.data;
        state.lockedInputs.isFetching = false;
        state.lockedInputs.isSuccess = true;
      }
    },
    datesChanged: (
      state,
      action: PayloadAction<{
        dates: typeof initialState.dates;
        updateMonthComponentState?: unknown[];
      }>,
    ) => {
      const { dates, updateMonthComponentState } = action.payload;
      state.dates = dates;
      if (updateMonthComponentState)
        state.updateMonthComponentState = updateMonthComponentState;
    },
    monthDataChanged: (
      state,
      action: PayloadAction<{
        data?: {
          dates: Exclude<typeof initialState.dates.data, undefined>;
          inputDisabled: Exclude<
            typeof initialState.lockedInputs.data,
            undefined
          >;
        };
        isFetching: boolean;
        isSuccess: boolean;
      }>,
    ) => {
      const { data, isFetching, isSuccess } = action.payload;
      state.dates = { data: data?.dates, isFetching, isSuccess };
      state.lockedInputs = { data: data?.inputDisabled, isFetching, isSuccess };
      state.updateMonthComponentState = [];
    },
    monthSettingsChanged: (
      state,
      action: PayloadAction<typeof initialState.monthSettings>,
    ) => {
      state.monthSettings = action.payload;
    },
    applicationSettingsChanged: (
      state,
      action: PayloadAction<{
        data?: {
          [key in keyof Exclude<
            typeof initialState.applicationSettings.data,
            undefined
          >]: Exclude<
            typeof initialState.applicationSettings.data,
            undefined
          >[key];
        } & {
          displayedCurrency: Exclude<
            typeof initialState.displayedCurrency.data,
            undefined
          >;
          autosaveInterval: Exclude<
            typeof initialState.autosaveInterval.data,
            undefined
          >;
          languageCode: Exclude<
            typeof initialState.languageCode.data,
            undefined
          >;
        } extends infer O
          ? { [Q in keyof O]: O[Q] }
          : never;

        isFetching: boolean;
        isSuccess: boolean;
      }>,
    ) => {
      const { data, isFetching, isSuccess } = action.payload;

      state.applicationSettings = {
        data: data
          ? {
              weekdays: data.weekdays,
              hourlyRate: data.hourlyRate,
              overtimeMultiplier: data.overtimeMultiplier,
            }
          : undefined,
        isFetching,
        isSuccess,
      };

      state.languageCode = {
        data: data?.languageCode ?? clientPreferredLanguage ?? "en",
        isFetching,
        isSuccess,
      };

      state.displayedCurrency = {
        data: data?.displayedCurrency,
        isFetching,
        isSuccess,
      };
      state.autosaveInterval = {
        data: data?.autosaveInterval,
        isFetching,
        isSuccess,
      };
    },
    showDaysStatsToggled: (state) => {
      state.showDaysStats = !state.showDaysStats;
    },
    savedStatusChanged: (
      state,
      action: PayloadAction<typeof initialState.savedStatus>,
    ) => {
      state.savedStatus = action.payload;
    },
    usernameChanged: (
      state,
      action: PayloadAction<typeof initialState.username>,
    ) => {
      state.username = action.payload;
    },
    emailChanged: (state, action: PayloadAction<typeof initialState.email>) => {
      state.email = action.payload;
      if (!action.payload) {
        const year = new Date().getFullYear();
        const month = new Date().getMonth() as monthNumberType;
        const { dates, lockedInputs, monthSettings, createdAt } =
          getLocalStorageMonthData(year, month);
        const applicationSettings = getApplicationSettingsInitialState();

        const autosaveInterval = getLocalStorageItem("autosaveInterval");
        const sanitizedAutosaveInterval = autosaveInterval ?? 30;

        const displayedCurrency = getLocalStorageItem("displayedCurrency");

        const sanitizedDisplayedCurrency = displayedCurrency ?? "";

        const languageCode = getLocalStorageItem("preferredLanguageCode");

        const sanitizedLanguageCode =
          languageCode ?? clientPreferredLanguage ?? "en";

        state.dates = {
          data: dates,
          isFetching: false,
          isSuccess: true,
        };
        state.autosaveInterval = {
          data: sanitizedAutosaveInterval,
          isFetching: false,
          isSuccess: true,
        };
        state.displayedCurrency = {
          data: sanitizedDisplayedCurrency,
          isFetching: false,
          isSuccess: true,
        };
        state.applicationSettings = {
          data: applicationSettings,
          isFetching: false,
          isSuccess: true,
        };
        state.monthSettings = {
          data: monthSettings,
          isFetching: false,
          isSuccess: true,
        };
        state.lockedInputs = {
          data: lockedInputs,
          isFetching: false,
          isSuccess: true,
        };
        state.monthCreatedAt = {
          data: createdAt,
          isFetching: false,
          isSuccess: true,
        };

        state.languageCode = {
          data: sanitizedLanguageCode,
          isFetching: false,
          isSuccess: true,
        };

        state.updateMonthComponentState = [];
      }
    },
    languageCodeChanged: (
      state,
      action: PayloadAction<
        Exclude<typeof initialState.languageCode.data, undefined>
      >,
    ) => {
      state.languageCode = {
        data: action.payload,
        isFetching: false,
        isSuccess: true,
      };
    },
    languageObjectisFetching: (state) => {
      state.languageObject.isFetching = true;
      state.languageObject.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(languageChanged.fulfilled, (state, action) => {
      state.languageCode.data = action.payload.languageCode;
      state.languageObject.data = action.payload.languageObject;
      state.languageObject.isFetching = state.languageCode.isFetching;
      state.languageObject.isSuccess = state.languageCode.isSuccess;
    });
  },
});

export const {
  yearOrMonthChanged,
  datePropertyChanged,
  lockedInputsToggled,
  showDaysStatsToggled,
  datesChanged,
  monthSettingsChanged,
  monthDataChanged,
  savedStatusChanged,
  usernameChanged,
  emailChanged,
  languageCodeChanged,
  languageObjectisFetching,
  applicationSettingsChanged,
} = mainSlice.actions;
