import {
  dateNumberType,
  englishWeekdayType,
  languageCodeType,
  monthNumberType,
} from "../../constants";

import {
  year_id,
  user_id,
  year_name,
  interval_id,
  day_id,
  began,
  ended,
  interval_number,
  autosave_interval,
  language_code,
  displayed_currency,
  user_default_hourly_rate,
  created_at,
  entry_id,
  color_id,
  day_name,
  red,
  green,
  blue,
  user_default_overtime_multiplier,
  username,
  password,
  email,
  month_id,
  input_disabled,
  month_custom_hourly_rate,
  month_custom_overtime_multiplier,
  month_number,
  is_holiday,
  day_custom_hourly_rate,
  day_custom_required_hours,
  day_custom_overtime_multiplier,
  date,
  years,
  work_intervals,
  users_settings,
  users_default_hourly_rate,
  users_default_required_hours,
  users_default_disabled_days,
  users_default_days_colors,
  users_default_overtime_multiplier,
  users,
  months_input_disabled,
  months_custom_hourly_rate,
  months_custom_required_hours,
  months_custom_disabled_days,
  months_custom_overtime_multiplier,
  months,
  holidays,
  days_custom_hourly_rate,
  days_custom_required_hours,
  days_custom_overtime_multiplier,
  days,
} from "../../constants";

export type requiredHoursType = {
  [weekday in englishWeekdayType]: string;
};

export type disabledDaysType = {
  [weekday in englishWeekdayType]: boolean;
};

declare module "knex/types/tables" {
  interface Year {
    [year_id]: number;
    [user_id]: string;
    [year_name]: number;
  }
  interface WorkInterval {
    [interval_id]: number;
    [day_id]: number;
    [began]: string;
    [ended]: string;
    [interval_number]: number;
  }
  interface UserSetting {
    [user_id]: string;
    [autosave_interval]: number;
    [language_code]: languageCodeType;
    [displayed_currency]: string;
  }
  interface UserDefaultHourlyRate {
    [user_default_hourly_rate]: string;
    [user_id]: string;
    [created_at]: string;
    [entry_id]: number;
  }

  type UserDefaultRequiredHours = requiredHoursType & {
    [user_id]: string;
    [created_at]: string;
    [entry_id]: number;
  } extends infer O
    ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
    : never;

  type UserDefaultDisabledDays = disabledDaysType & {
    [user_id]: string;
    [created_at]: string;
    [entry_id]: number;
  } extends infer O
    ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
    : never;

  interface UserDefaultDaysColors {
    [color_id]: number;
    [user_id]: string;
    [day_name]: englishWeekdayType;
    [red]: number;
    [green]: number;
    [blue]: number;
  }
  interface UserDefaultOvertimeMultiplier {
    [user_default_overtime_multiplier]: string;
    [user_id]: string;
    [created_at]: string;
    [entry_id]: number;
  }
  interface User {
    [user_id]: string;
    [username]: string;
    [password]: string;
    [email]: string;
  }
  interface MonthInputDisabled {
    [month_id]: number;
    [input_disabled]: boolean;
  }
  interface MonthCustomHourlyRate {
    [month_id]: number;
    [month_custom_hourly_rate]: string;
  }
  type MonthCustomRequiredHours = {
    [month_id]: number;
  } & requiredHoursType extends infer O
    ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
    : never;

  type monthCustomDisabledDays = {
    [month_id]: number;
  } & disabledDaysType extends infer O
    ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
    : never;

  interface MonthCustomOvertimeMultiplier {
    [month_id]: number;
    [month_custom_overtime_multiplier]: string;
  }

  interface Month {
    [month_id]: number;
    [year_id]: number;
    [month_number]: monthNumberType;
    [created_at]: string;
  }
  interface Holiday {
    [day_id]: number;
    [is_holiday]: boolean;
  }
  interface DayCustomHourlyRate {
    [day_id]: number;
    [day_custom_hourly_rate]: string;
  }
  interface DayCustomRequiredHours {
    [day_id]: number;
    [day_custom_required_hours]: string;
  }
  interface DayCustomOvertimeMultiplier {
    [day_id]: number;
    [day_custom_overtime_multiplier]: string;
  }
  interface Day {
    [day_id]: number;
    [month_id]: number;
    [date]: dateNumberType;
  }

  interface Tables {
    [years]: Year;
    [work_intervals]: WorkInterval;
    [users_settings]: UserSetting;
    [users_default_hourly_rate]: UserDefaultHourlyRate;
    [users_default_required_hours]: UserDefaultRequiredHours;
    [users_default_disabled_days]: UserDefaultDisabledDays;
    [users_default_days_colors]: UserDefaultDaysColors;
    [users_default_overtime_multiplier]: UserDefaultOvertimeMultiplier;
    [users]: User;
    [months_input_disabled]: MonthInputDisabled;
    [months_custom_hourly_rate]: MonthCustomHourlyRate;
    [months_custom_required_hours]: MonthCustomRequiredHours;
    [months_custom_disabled_days]: monthCustomDisabledDays;
    [months_custom_overtime_multiplier]: MonthCustomOvertimeMultiplier;
    [months]: Month;
    [holidays]: Holiday;
    [days_custom_hourly_rate]: DayCustomHourlyRate;
    [days_custom_required_hours]: DayCustomRequiredHours;
    [days_custom_overtime_multiplier]: DayCustomOvertimeMultiplier;
    [days]: Day;
  }
}
