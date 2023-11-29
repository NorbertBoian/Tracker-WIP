import { englishWeekdaysArray } from "../constants/constants";
import { useGetDefaultMonthSettingsQuery } from "../slices/apiSlice";
import { disabledDaysType, requiredHoursType } from "../slices/apiSliceTypes";
import { useAppSelector } from "../store";

export const useUserMonthDefaultSettings = (
  refetchOnMountOrArgChange = false,
) => {
  const year = useAppSelector((state) => state.main.year);
  const month = useAppSelector((state) => state.main.month);
  const email = useAppSelector((state) => state.main.email);
  const applicationSettings = useAppSelector(
    (state) => state.main.applicationSettings,
  );
  const displayedCurrency = useAppSelector(
    (state) => state.main.displayedCurrency,
  );

  const {
    data: userMonthDefaultSettings,
    isFetching,
    isSuccess,
  } = useGetDefaultMonthSettingsQuery(
    {
      year,
      month,
    },
    { skip: !email, refetchOnMountOrArgChange },
  );

  if (typeof userMonthDefaultSettings !== "string")
    return {
      data: userMonthDefaultSettings,
      isFetching,
      isSuccess,
    };
  else {
    const applicationSettingsData = applicationSettings.data;
    const displayedCurrencysData = displayedCurrency.data;

    let defaultMonthFallbackResponse:
      | {
          monthDefaultHourlyRate: string;
          monthDefaultOvertimeMultiplier: string;
          monthDefaultRequiredHours: requiredHoursType;
          monthDefaultDisabledDays: disabledDaysType;
        }
      | undefined;

    if (applicationSettingsData && displayedCurrencysData) {
      const monthDefaultRequiredHours = {} as requiredHoursType;
      const monthDefaultDisabledDays = {} as disabledDaysType;

      for (const weekday of englishWeekdaysArray) {
        Object.assign(monthDefaultRequiredHours, {
          [weekday]: applicationSettingsData.weekdays[weekday].requiredHours,
        });
        Object.assign(monthDefaultDisabledDays, {
          [weekday]: applicationSettingsData.weekdays[weekday].disabledDay,
        });
      }

      defaultMonthFallbackResponse = {
        monthDefaultRequiredHours,
        monthDefaultDisabledDays,
        monthDefaultOvertimeMultiplier:
          applicationSettingsData.overtimeMultiplier,
        monthDefaultHourlyRate: applicationSettingsData.hourlyRate,
      };
    }

    return {
      data: defaultMonthFallbackResponse,
      isFetching:
        applicationSettings.isFetching || displayedCurrency.isFetching,
      isSuccess: applicationSettings.isSuccess && displayedCurrency.isSuccess,
    };
  }
};
