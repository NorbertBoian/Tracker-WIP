import { memo, useEffect } from "react";
import { englishWeekdaysArray } from "../../constants/constants";
import {
  useGetCustomMonthSettingsQuery,
  useGetDatesQuery,
  useGetUserSettingsQuery,
} from "../../slices/apiSlice";
import {
  monthCustomSettingsType,
  userSettingsType,
} from "../../slices/apiSliceTypes";
import {
  applicationSettingsChanged,
  monthDataChanged,
  monthSettingsChanged,
} from "../../slices/mainSlice/mainSlice";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  applicationSettingsWeekdaysType,
  monthSettingsWeekdaysType,
} from "../../utils/typedLocalStorage/typedLocalStorage";

export const serverMonthSettingsToClientMonthSettings = (
  monthSettings: monthCustomSettingsType,
) => {
  const weekdays = {} as monthSettingsWeekdaysType;
  for (const weekday of englishWeekdaysArray) {
    Object.assign(weekdays, {
      [weekday]: {
        requiredHours: monthSettings.monthCustomRequiredHours[weekday],
        disabledDay: monthSettings.monthCustomDisabledDays[weekday],
      },
    });
  }
  return {
    hourlyRate: monthSettings.monthCustomHourlyRate,
    overtimeMultiplier: monthSettings.monthCustomOvertimeMultiplier,
    weekdays,
  };
};

export const serverApplicationSettingsToClientApplicationSettings = (
  applicationSettings: userSettingsType,
) => {
  const weekdays = {} as applicationSettingsWeekdaysType;
  for (const weekday of englishWeekdaysArray) {
    Object.assign(weekdays, {
      [weekday]: {
        requiredHours: applicationSettings.userDefaultRequiredHours[weekday],
        disabledDay: applicationSettings.userDefaultDisabledDays[weekday],
        color: applicationSettings.userDefaultDaysColors[weekday],
      },
    });
  }
  return {
    weekdays,
    hourlyRate: applicationSettings.userDefaultHourlyRate,
    overtimeMultiplier: applicationSettings.userDefaultOvertimeMultiplier,
    displayedCurrency: applicationSettings.displayedCurrency,
    autosaveInterval: applicationSettings.autosaveInterval,
    languageCode: applicationSettings.languageCode,
  };
};

export const SubscribeToApi = memo(() => {
  const email = useAppSelector((state) => state.main.email);
  const year = useAppSelector((state) => state.main.year);
  const month = useAppSelector((state) => state.main.month);

  const { refetch: undesired, ...customMonthSettings } =
    useGetCustomMonthSettingsQuery(
      { month, year },
      { skip: !email, refetchOnMountOrArgChange: true },
    );

  const { refetch: notNeeded, ...dates } = useGetDatesQuery(
    { month, year },
    { skip: !email, refetchOnMountOrArgChange: true },
  );

  const { refetch: notUsed, ...userSettings } = useGetUserSettingsQuery(
    email ?? false,
    {
      skip: !email,
      refetchOnMountOrArgChange: true,
    },
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (email) dispatch(monthDataChanged(dates));
  }, [dates, dispatch, email]);

  useEffect(() => {
    if (email) {
      dispatch(
        applicationSettingsChanged({
          ...userSettings,
          data: userSettings.data
            ? serverApplicationSettingsToClientApplicationSettings(
                userSettings.data,
              )
            : undefined,
        }),
      );
    }
  }, [userSettings, dispatch, email]);

  useEffect(() => {
    if (email) {
      dispatch(
        monthSettingsChanged({
          ...customMonthSettings,
          data: customMonthSettings.data
            ? serverMonthSettingsToClientMonthSettings(customMonthSettings.data)
            : undefined,
        }),
      );
    }
  }, [customMonthSettings, dispatch, email]);

  return null;
});

SubscribeToApi.displayName = "SubscribeToApi";
