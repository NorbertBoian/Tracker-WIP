import { getCombinedMonthSettings } from "../functions/getCombinedMonthSettings";
import { useMonthCustomSettings } from "./useMonthCustomSettings";
import { useMonthDefaultSettings } from "./useMonthDefaultSettings";

export const useMonthData = () => {
  const monthDefaultSettings = useMonthDefaultSettings();

  const monthCustomSettings = useMonthCustomSettings();

  const combinedMonthSettings = getCombinedMonthSettings(
    monthCustomSettings.data,
    monthDefaultSettings.data,
  );

  return {
    combinedMonthSettings: {
      data: combinedMonthSettings,
      isFetching:
        monthDefaultSettings.isFetching || monthCustomSettings.isFetching,
      isSuccess:
        monthDefaultSettings.isSuccess && monthCustomSettings.isSuccess,
    },
  };
};
