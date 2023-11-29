import {
  defaultDaysColors,
  englishWeekdaysArray,
} from "../../../constants/constants";
import {
  applicationSettingsType,
  applicationSettingsWeekdaysType,
  getLocalStorageItem,
} from "../../../utils/typedLocalStorage/typedLocalStorage";

export const applicationSettingsBlankWeekdays =
  englishWeekdaysArray.reduce<applicationSettingsWeekdaysType>(
    (prevValue, weekday) => {
      const weekdayInitialState = {
        [weekday]: {
          requiredHours: "",
          disabledDay: false,
          color: defaultDaysColors[weekday],
        },
      };
      const newValue = { ...prevValue, ...weekdayInitialState };
      return newValue;
    },
    {} as applicationSettingsWeekdaysType,
  );

const blankApplicationSettings: Omit<applicationSettingsType, "createdAt"> = {
  weekdays: applicationSettingsBlankWeekdays,
  hourlyRate: "",
  overtimeMultiplier: "",
};

export const getApplicationSettingsInitialState = () => {
  const initialApplicationSettings = getLocalStorageItem("applicationSettings");
  const mostRecentApplicationSettings = initialApplicationSettings
    ? initialApplicationSettings.reverse()[0]
    : undefined;

  if (mostRecentApplicationSettings) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, ...applicationSettingsWithoutCreatedAt } =
      mostRecentApplicationSettings;
    return applicationSettingsWithoutCreatedAt;
  } else {
    return blankApplicationSettings;
  }
};
