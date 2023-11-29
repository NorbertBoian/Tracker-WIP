import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/src/types/types-external";
import {
  englishWeekdaysArray,
  englishWeekdayType,
} from "../constants/constants";
import { monthSettingsBlankWeekdays } from "../functions/getLocalStorageMonthData";

const initialWeekdays = {} as {
  [weekday in englishWeekdayType]: {
    requiredHours: string;
    requiredHoursValidity: boolean;
    disabledDay: boolean;
  };
};

type weekdaysWithValidity = typeof initialWeekdays;

for (const weekday of englishWeekdaysArray) {
  Object.assign(initialWeekdays, {
    [weekday]: {
      ...monthSettingsBlankWeekdays[weekday],
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
  hourlyRate: "",
  overtimeMultiplier: "",
  hourlyRateValidity: true,
  overtimeMultiplierValidity: true,
  cursors: {
    overtimeMultiplier: [0],
    hourlyRate: [0],
    weekdays: weekdaysCursors,
  },
};

export const monthSettingsSlice = createSlice({
  name: "monthSettings",
  initialState,
  reducers: {
    monthSettingsWeekdayPropertyChanged: <
      Key extends keyof typeof initialState.weekdays[keyof typeof initialState.weekdays],
    >(
      state: WritableDraft<typeof initialState>,
      action: PayloadAction<{
        weekday: keyof typeof initialState.weekdays;
        property: Key;
        value: (Omit<
          typeof initialState.weekdays[keyof typeof initialState.weekdays],
          "requiredHours"
        > & { requiredHours: { value: string; cursor?: number[] } })[Key];
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
    monthSettingChanged: <
      Key extends Exclude<keyof typeof initialState, "weekdays" | "cursors">,
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
    monthSettingsChanged: (
      state,
      action: PayloadAction<
        Omit<
          typeof initialState,
          | "hourlyRateValidity"
          | "overtimeMultiplierValidity"
          | "weekdays"
          | "cursors"
        > & {
          weekdays: typeof monthSettingsBlankWeekdays;
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
  },
});

export const {
  // monthSettingsWeekdayPropertyChanged,
  // monthSettingChanged,
  monthSettingsChanged,
} = monthSettingsSlice.actions;

export const monthSettingsWeekdayPropertyChanged = monthSettingsSlice.actions
  .monthSettingsWeekdayPropertyChanged as <
  Key extends keyof typeof initialState.weekdays[keyof typeof initialState.weekdays],
>(payload: {
  weekday: keyof typeof initialState.weekdays;
  property: Key;
  value: (Omit<
    typeof initialState.weekdays[keyof typeof initialState.weekdays],
    "requiredHours"
  > & { requiredHours: { value: string; cursor?: number[] } })[Key];
}) => PayloadAction<{
  weekday: keyof typeof initialState.weekdays;
  property: Key;
  value: (Omit<
    typeof initialState.weekdays[keyof typeof initialState.weekdays],
    "requiredHours"
  > & { requiredHours: { value: string; cursor?: number[] } })[Key];
}>;

export const monthSettingChanged = monthSettingsSlice.actions
  .monthSettingChanged as <
  Key extends Exclude<keyof typeof initialState, "weekdays" | "cursors">,
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
