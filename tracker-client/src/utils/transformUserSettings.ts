import {
  defaultDaysColors,
  friday,
  monday,
  saturday,
  sunday,
  thursday,
  tuesday,
  wednesday,
} from "../constants/constants";
import {
  userSettingsType,
  userSettingsUntransformedType,
} from "../slices/apiSliceTypes";

const blankUserDefaultRequiredHours = {
  [monday]: "",
  [tuesday]: "",
  [wednesday]: "",
  [thursday]: "",
  [friday]: "",
  [saturday]: "",
  [sunday]: "",
};

const blankUserDefaultDisabledDays = {
  [monday]: false,
  [tuesday]: false,
  [wednesday]: false,
  [thursday]: false,
  [friday]: false,
  [saturday]: false,
  [sunday]: false,
};

export const userDefaultsBlankResponse: userSettingsType = {
  userDefaultRequiredHours: blankUserDefaultRequiredHours,
  userDefaultOvertimeMultiplier: "",
  userDefaultHourlyRate: "",
  userDefaultDisabledDays: blankUserDefaultDisabledDays,
  userDefaultDaysColors: defaultDaysColors,
  displayedCurrency: "¤",
  autosaveInterval: 30,
  languageCode: "en",
};

export const transformUserSettingsResponse = (
  response?: userSettingsUntransformedType | string,
): userSettingsType => {
  if (!response || typeof response === "string")
    return userDefaultsBlankResponse;
  else {
    const { userDefaultDaysColors } = response;

    return {
      ...response,
      userDefaultDaysColors: {
        ...defaultDaysColors,
        ...userDefaultDaysColors,
      },
    };
  }
};
