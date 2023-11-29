import { useGetCustomMonthSettingsQuery } from "../slices/apiSlice";
import { useAppSelector } from "../store";
import { customMonthSettingsBlankResponse } from "../utils/transformCustomMonthSettings";

export const useUserMonthCustomSettings = () => {
  const month = useAppSelector((state) => state.main.month);
  const year = useAppSelector((state) => state.main.year);
  const result = useGetCustomMonthSettingsQuery({
    month,
    year,
  });
  return { ...result, data: result.data ?? customMonthSettingsBlankResponse };
  // const { data: customMonthSettingsData, ...rest } =
  //   useGetCustomMonthSettingsQuery({
  //     month,
  //     year,
  //   });
  // return !false && customMonthSettingsData
  //   ? customMonthSettingsData
  //   : customMonthSettingsBlankResponse;
};
