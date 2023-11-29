import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  englishWeekdaysArray,
  englishWeekdayType,
  languageCodeType,
} from "../constants/constants";
import { WritableDraft } from "immer/src/types/types-external";
import { languageObject as en, languageObjectType } from "../languages/en";
import { applicationSettingsBlankWeekdays } from "./mainSlice/functions/getApplicationSettingsInitialState";
import { applicationSettingsWeekdaysType } from "../utils/typedLocalStorage/typedLocalStorage";
import { emptyStringsLanguageObject } from "../languages/emptyStrings";

const initialWeekdays = {} as {
  [weekday in englishWeekdayType]: {
    requiredHours: string;
    requiredHoursValidity: boolean;
    disabledDay: boolean;
    color: [number, number, number];
  };
};

type weekdaysWithValidity = typeof initialWeekdays;

for (const weekday of englishWeekdaysArray) {
  Object.assign(initialWeekdays, {
    [weekday]: {
      ...applicationSettingsBlankWeekdays[weekday],
      requiredHoursValidity: true,
    },
  });
}

const weekdaysCursors = {} as {
  [weekday in englishWeekdayType]: number[];
};

englishWeekdaysArray.forEach((englishWeekday) =>
  Object.assign(weekdaysCursors, { [englishWeekday]: [0] }),
);

const initialState = {
  weekdays: initialWeekdays,
  languageCode: {
    data: undefined as languageCodeType | undefined,
    isFetching: false,
    isSuccess: true,
  },
  languageObject: {
    data: emptyStringsLanguageObject,
    isFetching: true,
    isSuccess: false,
  },
  hourlyRate: "",
  overtimeMultiplier: "",
  displayedCurrency: "",
  hourlyRateValidity: true,
  overtimeMultiplierValidity: true,
  displayedCurrencyValidity: true,
  autosaveInterval: 30,
  cursors: {
    overtimeMultiplier: [0],
    hourlyRate: [0],
    weekdays: weekdaysCursors,
  },
};

export const applicationSettingsLanguageChanged = createAsyncThunk<
  {
    languageCode?: languageCodeType;
    languageObject: languageObjectType;
  },
  typeof initialState.languageCode
>("applicationSettings/languageChanged", async (languageCode, { dispatch }) => {
  dispatch(languageCodeChanged(languageCode));
  if (languageCode.data) {
    try {
      dispatch(languageObjectisFetching());
      const { languageObject } = await import(
        `../languages/${languageCode.data}.ts`
      );
      return { languageCode: languageCode.data, languageObject };
    } catch (err) {
      // console.log("caught", err);
      return { languageCode: "en", languageObject: en };
    }
  } else {
    return { languageObject: emptyStringsLanguageObject };
  }
});
export const applicationSettingsSlice = createSlice({
  name: "applicationSettings",
  initialState,
  reducers: {
    applicationSettingsWeekdayPropertyChanged: <
      Key extends keyof (typeof initialState.weekdays)[keyof typeof initialState.weekdays],
    >(
      state: WritableDraft<typeof initialState>,
      action: PayloadAction<{
        weekday: keyof typeof initialState.weekdays;
        property: Key;
        value: (Omit<
          (typeof initialState.weekdays)[keyof typeof initialState.weekdays],
          "requiredHours"
        > & {
          requiredHours: {
            value: (typeof initialState.weekdays)[keyof typeof initialState.weekdays]["requiredHours"];
            cursor?: number[];
          };
        })[Key];
      }>,
    ) => {
      const { property, value, weekday } = action.payload;
      if (typeof value === "object" && "value" in value) {
        const castedKey = property as "requiredHours";
        state.weekdays[weekday][castedKey] = value.value;
        if (value.cursor) state.cursors.weekdays[weekday] = value.cursor;
      } else {
        const castedKey = property as Exclude<Key, "requiredHours">;
        state.weekdays[weekday][castedKey] = value as any;
      }
    },
    applicationSettingsWeekdayDisabledDayToggled: (
      state,
      action: PayloadAction<keyof typeof initialState.weekdays>,
    ) => {
      const weekday = action.payload;
      state.weekdays[weekday].disabledDay =
        !state.weekdays[weekday].disabledDay;
    },
    applicationSettingChanged: <
      Key extends Exclude<
        keyof typeof initialState,
        "languageCode" | "languageObject" | "weekdays" | "cursors"
      >,
    >(
      state: WritableDraft<typeof initialState>,
      action: PayloadAction<{
        property: Key;
        value: (Omit<
          typeof initialState,
          "hourlyRate" | "overtimeMultiplier"
        > & {
          hourlyRate: { value: string; cursor?: number[] };
          overtimeMultiplier: { value: string; cursor?: number[] };
        })[Key];
      }>,
    ) => {
      const { property, value } = action.payload;
      if (typeof value === "object" && "value" in value) {
        const castedKey = property as "hourlyRate" | "overtimeMultiplier";
        state[castedKey] = value.value;
        if (value.cursor) state.cursors[castedKey] = value.cursor;
      } else {
        const castedKey = property as Exclude<
          Key,
          "hourlyRateValidity" | "overtimeMultiplierValidity"
        >;
        state[castedKey] = value as any;
      }
    },
    applicationSettingsChanged: (
      state,
      action: PayloadAction<
        Omit<
          typeof initialState,
          | "autosaveInterval"
          | "languageCode"
          | "languageObject"
          | "hourlyRateValidity"
          | "overtimeMultiplierValidity"
          | "displayedCurrencyValidity"
          | "weekdays"
          | "cursors"
        > & {
          autosaveInterval?: typeof initialState.autosaveInterval;
        } & {
          weekdays: applicationSettingsWeekdaysType;
        } extends infer O
          ? { [Q in keyof O]: O[Q] }
          : never
      >,
    ) => {
      const { weekdays } = action.payload;
      const weekdaysWithValidity = {} as weekdaysWithValidity;
      for (const weekday of englishWeekdaysArray) {
        Object.assign(weekdaysWithValidity, {
          [weekday]: {
            ...weekdays[weekday],
            requiredHoursValidity:
              state.weekdays[weekday].requiredHoursValidity,
          },
        });
      }
      return { ...state, ...action.payload, weekdays: weekdaysWithValidity };
    },
    languageCodeChanged: (
      state,
      action: PayloadAction<typeof initialState.languageCode>,
    ) => {
      state.languageCode = action.payload;
    },
    languageObjectisFetching: (state) => {
      state.languageObject.isFetching = true;
      state.languageObject.isSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      applicationSettingsLanguageChanged.fulfilled,
      (state, action) => {
        state.languageCode.data = action.payload.languageCode;
        state.languageObject.data = action.payload.languageObject;
        state.languageObject.isFetching = state.languageCode.isFetching;
        state.languageObject.isSuccess = state.languageCode.isSuccess;
      },
    );
  },
});

export const {
  applicationSettingsWeekdayDisabledDayToggled,
  applicationSettingsChanged,
  languageCodeChanged,
  languageObjectisFetching,
} = applicationSettingsSlice.actions;

export const applicationSettingChanged = applicationSettingsSlice.actions
  .applicationSettingChanged as <
  Key extends Exclude<
    keyof typeof initialState,
    "languageCode" | "languageObject" | "weekdays" | "cursors"
  >,
>(payload: {
  property: Key;
  value: (Omit<typeof initialState, "hourlyRate" | "overtimeMultiplier"> & {
    hourlyRate: { value: string; cursor?: number[] };
    overtimeMultiplier: { value: string; cursor?: number[] };
  })[Key];
}) => PayloadAction<{
  property: Key;
  value: (Omit<typeof initialState, "hourlyRate" | "overtimeMultiplier"> & {
    hourlyRate: { value: string; cursor?: number[] };
    overtimeMultiplier: { value: string; cursor?: number[] };
  })[Key];
}>;

export const applicationSettingsWeekdayPropertyChanged =
  applicationSettingsSlice.actions
    .applicationSettingsWeekdayPropertyChanged as <
    Key extends keyof (typeof initialState.weekdays)[keyof typeof initialState.weekdays],
  >(payload: {
    weekday: keyof typeof initialState.weekdays;
    property: Key;
    value: (Omit<
      (typeof initialState.weekdays)[keyof typeof initialState.weekdays],
      "requiredHours"
    > & {
      requiredHours: {
        value: (typeof initialState.weekdays)[keyof typeof initialState.weekdays]["requiredHours"];
        cursor?: number[];
      };
    })[Key];
  }) => PayloadAction<{
    weekday: keyof typeof initialState.weekdays;
    property: Key;
    value: (Omit<
      (typeof initialState.weekdays)[keyof typeof initialState.weekdays],
      "requiredHours"
    > & {
      requiredHours: {
        value: (typeof initialState.weekdays)[keyof typeof initialState.weekdays]["requiredHours"];
        cursor?: number[];
      };
    })[Key];
  }>;
