import {
  englishWeekdayType,
  friday,
  monday,
  saturday,
  sunday,
  thursday,
  tuesday,
  wednesday,
} from "../constants/constants";
import { monthCustomSettingsType } from "../slices/apiSliceTypes";

const blankCustomMonthRequiredHours: {
  [weekday in englishWeekdayType]: string;
} = {
  [monday]: "",
  [tuesday]: "",
  [wednesday]: "",
  [thursday]: "",
  [friday]: "",
  [saturday]: "",
  [sunday]: "",
};
const blankCustomMonthDisabledDays: {
  [weekday in englishWeekdayType]: undefined;
} = {
  [monday]: undefined,
  [tuesday]: undefined,
  [wednesday]: undefined,
  [thursday]: undefined,
  [friday]: undefined,
  [saturday]: undefined,
  [sunday]: undefined,
};
export const customMonthSettingsBlankResponse = {
  monthCustomRequiredHours: blankCustomMonthRequiredHours,
  monthCustomDisabledDays: blankCustomMonthDisabledDays,
  monthCustomOvertimeMultiplier: "",
  monthCustomHourlyRate: "",
};
export const transformCustomMonthSettingsResponse = (
  response?: monthCustomSettingsType | string,
) => {
  if (!response || typeof response === "string")
    return customMonthSettingsBlankResponse;
  else return response;
};
