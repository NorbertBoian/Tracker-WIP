import { useGetDatesQuery } from "../slices/apiSlice";
import { useAppSelector } from "../store";
import { getEmptyDatesArray } from "../utils/getEmptyDatesArray";

export const useUserDates = () => {
  const month = useAppSelector((state) => state.main.month);
  const year = useAppSelector((state) => state.main.year);
  const { data: getTimesData, isError } = useGetDatesQuery({ month, year });

  const sanitizedGetTimesData =
    !isError && getTimesData
      ? getTimesData
      : {
          inputDisabled: true,
          dates: { present: getEmptyDatesArray(year, month) },
        };
  const { inputDisabled: userLockedInputs, dates: userDates } =
    sanitizedGetTimesData;

  return { userLockedInputs, userDates };
};
