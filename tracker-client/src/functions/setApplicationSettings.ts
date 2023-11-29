import {
  defaultDaysColors,
  englishMonthNameType,
  englishMonthsArray,
  englishWeekdaysArray,
  englishWeekdayType,
  languageCodeType,
} from "../constants/constants";
import { apiSlice } from "../slices/apiSlice";
import { userDefaultDaysColorsType } from "../slices/apiSliceTypes";
import { applicationSettingsChanged } from "../slices/mainSlice/mainSlice";
import { store } from "../store";
import {
  applicationSettingsWeekdaysType,
  getLocalStorageItem,
  setLocalStorageItem,
} from "../utils/typedLocalStorage/typedLocalStorage";
import { getCreateNotification } from "./createNotification/createNotification";
import { getRateLimitedFunction } from "./getRateLimitedFunction";

type applicationSettingsType = {
  weekdays: applicationSettingsWeekdaysType;
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  autosaveInterval: number;
  languageCode: languageCodeType;
};

const getLocalStorageLastInsertedMonthCreatedAt = () => {
  const localStorageYears = getLocalStorageItem("years");
  if (!localStorageYears) return 0;
  const lastInserted = Math.max(
    ...Object.values(localStorageYears)
      .map((yearData) =>
        Object.values(yearData)
          .filter((monthData) => monthData.createdAt !== undefined)
          .map((monthData) => +monthData.createdAt),
      )
      .flat(),
  );
  return lastInserted === -Infinity ? 0 : lastInserted;
};

export const clientApplicationSettingsToServerApplicationSettings = (
  applicationSettings: applicationSettingsType,
) => {
  const userDefaultRequiredHours = {} as {
    [weekday in englishWeekdayType]: string;
  };
  const userDefaultDisabledDays = {} as {
    [weekday in englishWeekdayType]: boolean;
  };
  const userDefaultDaysColors = {} as {
    [weekday in englishWeekdayType]: [number, number, number];
  };
  for (const weekday of englishWeekdaysArray) {
    Object.assign(userDefaultRequiredHours, {
      [weekday]: applicationSettings.weekdays[weekday].requiredHours,
    });
    Object.assign(userDefaultDisabledDays, {
      [weekday]: applicationSettings.weekdays[weekday].disabledDay,
    });
    Object.assign(userDefaultDaysColors, {
      [weekday]: applicationSettings.weekdays[weekday].color,
    });
  }
  return {
    userDefaultOvertimeMultiplier: applicationSettings.overtimeMultiplier,
    userDefaultHourlyRate: applicationSettings.hourlyRate,
    userDefaultRequiredHours,
    userDefaultDisabledDays,
    userDefaultDaysColors,
    displayedCurrency: applicationSettings.displayedCurrency,
    autosaveInterval: applicationSettings.autosaveInterval,
    languageCode: applicationSettings.languageCode,
  };
};

const createFailNotification = getCreateNotification(
  "Failed to save application settings on server.",
  "alert",
);

const createSuccessNotification = getCreateNotification(
  "Saved application settings.",
);

const setApplicationSettingsInLongTermStorage = async (applicationSettings: {
  weekdays: applicationSettingsWeekdaysType;
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  autosaveInterval: number;
  languageCode: languageCodeType;
}) => {
  const { email } = store.getState().main;
  const { dispatch } = store;
  if (email) {
    const userSettings =
      clientApplicationSettingsToServerApplicationSettings(applicationSettings);

    const { userDefaultDaysColors } = userSettings;

    const userDefaultDaysColorsDifferentFromDefault: Partial<userDefaultDaysColorsType> =
      {};
    for (const day in userDefaultDaysColors) {
      const castedDay = day as englishWeekdayType;
      const castedDayDefaultColor = userDefaultDaysColors[castedDay] as [
        number,
        number,
        number,
      ];
      const redDifferent =
        castedDayDefaultColor[0] !== defaultDaysColors[castedDay][0];
      const greenDifferent =
        castedDayDefaultColor[1] !== defaultDaysColors[castedDay][1];
      const blueDifferent =
        castedDayDefaultColor[2] !== defaultDaysColors[castedDay][2];
      if (redDifferent || greenDifferent || blueDifferent)
        Object.assign(userDefaultDaysColorsDifferentFromDefault, {
          [day]: userDefaultDaysColors[castedDay],
        });
    }
    const userDefaultSettings = {
      ...userSettings,
      userDefaultDaysColors: userDefaultDaysColorsDifferentFromDefault,
    };

    const response = await dispatch(
      apiSlice.endpoints.updateUserSettings.initiate(userDefaultSettings),
    );

    if ("error" in response) {
      createFailNotification();
    } else {
      createSuccessNotification();
    }
  } else {
    const {
      displayedCurrency,
      languageCode,
      ...applicationSettingsWithoutDisplayedCurrencyAndLanguageCode
    } = applicationSettings;
    setLocalStorageItem("displayedCurrency", displayedCurrency);
    setLocalStorageItem("preferredLanguageCode", languageCode);
    const localStorageApplicationSettings = getLocalStorageItem(
      "applicationSettings",
    );
    const sanitizedLocalStorageApplicationSettings =
      localStorageApplicationSettings ? localStorageApplicationSettings : [];

    const monthLastInsertedCreatedAt =
      getLocalStorageLastInsertedMonthCreatedAt();

    const applicationSettingsWithoutUnneeded =
      sanitizedLocalStorageApplicationSettings.filter(
        (applicationSettings) =>
          applicationSettings.createdAt < monthLastInsertedCreatedAt,
      );

    const createdAt = Date.now();
    setLocalStorageItem("applicationSettings", [
      ...applicationSettingsWithoutUnneeded,
      {
        ...applicationSettingsWithoutDisplayedCurrencyAndLanguageCode,
        createdAt,
      },
    ]);
  }
};

const rateLimitedSetApplicationSettingsInLongTermStorage =
  getRateLimitedFunction(
    setApplicationSettingsInLongTermStorage,
    100,
    false,
    true,
    true,
  );

export const setApplicationSettings = (applicationSettings: {
  weekdays: {
    [weekday in englishWeekdayType]: {
      requiredHours: string;
      requiredHoursValidity?: boolean;
      disabledDay: boolean;
      color: [number, number, number];
    };
  };
  languageCode: languageCodeType;
  hourlyRate: string;
  overtimeMultiplier: string;
  displayedCurrency: string;
  autosaveInterval: number;
}) => {
  const { dispatch } = store;

  rateLimitedSetApplicationSettingsInLongTermStorage(applicationSettings);
  dispatch(
    applicationSettingsChanged({
      data: applicationSettings,
      isFetching: false,
      isSuccess: true,
    }),
  );
};
