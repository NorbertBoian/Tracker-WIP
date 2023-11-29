export const __prod__ = process.env.NODE_ENV === "production";
export const COOKIE_NAME = "qid" as const;

export const sunday = "sunday" as const;
export const monday = "monday" as const;
export const tuesday = "tuesday" as const;
export const wednesday = "wednesday" as const;
export const thursday = "thursday" as const;
export const friday = "friday" as const;
export const saturday = "saturday" as const;

export const englishWeekdaysArray = [
  sunday,
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
] as const;

// prettier-ignore
export type dateNumberType = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;

export type monthNumberType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type englishWeekdayType = typeof englishWeekdaysArray[number];

export const Français = "Français" as const;
export const Deutsch = "Deutsch" as const;
export const Português = "Português" as const;
export const Română = "Română" as const;
export const Русский = "Русский" as const;
export const Ελληνικά = "Ελληνικά" as const;
export const Magyar = "Magyar" as const;
export const Nederlands = "Nederlands" as const;
export const Italiano = "Italiano" as const;
export const Español = "Español" as const;
export const Svenska = "Svenska" as const;
export const English = "English" as const;

export type colorType = [number, number, number];

export const languageNames = {
  en: English,
  ro: Română,
  fr: Français,
  de: Deutsch,
  es: Español,
  sv: Svenska,
  pt: Português,
  hu: Magyar,
  it: Italiano,
  ru: Русский,
  el: Ελληνικά,
  nl: Nederlands,
} as const;

export type languageCodeType = keyof typeof languageNames;

export const languageCodes = Object.keys(languageNames) as languageCodeType[];

export const trueSendMessageErrorCause = {
  cause: { sendMessage: true },
} as const;

//All of these allow empty string

export const requiredHoursRegexDatabaseString =
  "^1\\d$|^2[0-4]$|^\\d\\\\?$" as const;

export const requiredHoursRegex = /^1\d$|^2[0-4]$|^\d?$/;

export const overtimeMultiplierRegexDatabaseString =
  "^0[.,]\\d{1,3}$|^[1-9]\\d*[.,]+\\d+$|^[1-9]\\d{1,4}$|^[.,]\\\\?\\d+$|^$" as const;

export const overtimeMultiplierRegex =
  /^0[.,]\d{1,3}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,4}$|^[.,]?\d+$|^$/;

export const overtimeMultiplierTrailingDecimalPointAllowedRegexDatabaseString =
  "^0[.,]\\d{0,3}$|^[1-9]\\d*[.,]\\\\?\\d*$|^[.,]\\\\?\\d*$" as const;

export const overtimeMultiplierTrailingDecimalPointAllowedRegex =
  /^0[.,]\d{0,3}$|^[1-9]\d*[.,]?\d*$|^[.,]?\d*$/;

export const hourlyRateRegexDatabaseString =
  "^0[.,]\\d{1,4}$|^[1-9]\\d*[.,]+\\d+$|^[1-9]\\d{1,5}$|^[.,]\\\\?\\d+$|^$" as const;

export const hourlyRateRegex =
  /^0[.,]\d{1,4}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,5}$|^[.,]?\d+$|^$/;

export const hourlyRateTrailingDecimalPointAllowedRegexDatabaseString =
  "^0[.,]\\d{0,4}$|^[1-9]\\d*[.,]\\\\?\\d*$|^[.,]\\\\?\\d*$" as const;

export const hourlyRateTrailingDecimalPointAllowedRegex =
  /^0[.,]\d{0,4}$|^[1-9]\d*[.,]?\d*$|^[.,]?\d*$/;

export const timeRegexDatabaseString =
  "^\\d\\\\?$|^[01]\\d$|^2[0-4]$|^(\\\\?:(\\\\?:(\\\\?:(\\\\?:[01]\\d\\\\?)|(\\\\?:2[0-3]\\\\?)))|\\d\\\\?):(\\\\?:[0-5]\\d\\\\?)\\\\?$|^24:0{0,2}$" as const;

export const timeRegex =
  /^\d?$|^[01]\d$|^2[0-4]$|^(?:(?:(?:(?:[01]\d?)|(?:2[0-3]?)))|\d?):(?:[0-5]\d?)?$|^24:0{0,2}$/;

//No empty strings allowed

export const displayedCurrencyRegexDatabaseString = "^\\D{1,5}$" as const;

export const displayedCurrencyRegex = /^\D{1,5}$/;

export const requiredHoursNoEmptyStringRegexDatabaseString =
  "^1\\d$|^2[0-4]$|^\\d$" as const;

export const requiredHoursNoEmptyStringRegex = /^1\d$|^2[0-4]$|^\d$/;

export const overtimeMultiplierNoEmptyStringRegexDatabaseString =
  "^0[.,]\\d{1,3}$|^[1-9]\\d*[.,]+\\d+$|^[1-9]\\d{1,4}$|^[.,]\\\\?\\d+$" as const;

export const overtimeMultiplierNoEmptyStringRegex =
  /^0[.,]\d{1,3}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,4}$|^[.,]?\d+$/;

export const hourlyRateNoEmptyStringRegexDatabaseString =
  "^0[.,]\\d{1,4}$|^[1-9]\\d*[.,]+\\d+$|^[1-9]\\d{1,5}$|^[.,]\\\\?\\d+$" as const;

export const hourlyRateNoEmptyStringRegex =
  /^0[.,]\d{1,4}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,5}$|^[.,]?\d+$/;

export const html5EmailRegexDatabaseString =
  "^[a-z0-9.!#$%&/''*+/=\\\\?^_`{|}~-]+@[a-z0-9](\\\\?:[a-z0-9-]{0,61}[a-z0-9])\\\\?(\\\\?:.[a-z0-9](\\\\?:[a-z0-9-]{0,61}[a-z0-9])\\\\?)*$" as const;

export const html5EmailRegex =
  /^[a-z0-9.!#$%&/'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/;
//Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email#basic_validation

export const notLoggedInMessage = "Not logged in." as const;
export const unableToUpdateDatabaseMessage =
  "Unable to update database." as const;
export const successfullyUpdated = "Successfully updated" as const;

export const doesntExistInDatabase = "doesn't exist in database.";
export const yearDoesntExistInDatabase = `Year ${doesntExistInDatabase}`;
export const monthDoesntExistInDatabase = `Month ${doesntExistInDatabase}`;

export const unexpectedErrorOccurredMessage = "Some unexpected error occurred.";

export const desc = "desc" as const;

export const IS_DISTINCT_FROM_excluded = " IS DISTINCT FROM excluded" as const;

export const user_id = "user_id" as const;
export const year_name = "year_name" as const;
export const interval_id = "interval_id" as const;
export const day_id = "day_id" as const;
export const began = "began" as const;
export const ended = "ended" as const;
export const interval_number = "interval_number" as const;
export const autosave_interval = "autosave_interval" as const;
export const language_code = "language_code" as const;
export const displayed_currency = "displayed_currency" as const;
export const user_default_hourly_rate = "user_default_hourly_rate" as const;
export const created_at = "created_at" as const;
export const entry_id = "entry_id" as const;
export const color_id = "color_id" as const;
export const day_name = "day_name" as const;
export const red = "red" as const;
export const green = "green" as const;
export const blue = "blue" as const;
export const user_default_overtime_multiplier =
  "user_default_overtime_multiplier" as const;
export const username = "username" as const;
export const password = "password" as const;
export const email = "email" as const;
export const month_id = "month_id" as const;
export const input_disabled = "input_disabled" as const;
export const month_custom_hourly_rate = "month_custom_hourly_rate" as const;
export const month_custom_overtime_multiplier =
  "month_custom_overtime_multiplier" as const;
export const year_id = "year_id" as const;
export const month_number = "month_number" as const;
export const is_holiday = "is_holiday" as const;
export const day_custom_hourly_rate = "day_custom_hourly_rate" as const;
export const day_custom_required_hours = "day_custom_required_hours" as const;
export const day_custom_overtime_multiplier =
  "day_custom_overtime_multiplier" as const;
export const date = "date" as const;
export const years = "years" as const;
export const work_intervals = "work_intervals" as const;
export const users_settings = "users_settings" as const;
export const users_default_hourly_rate = "users_default_hourly_rate" as const;
export const users_default_required_hours =
  "users_default_required_hours" as const;
export const users_default_disabled_days =
  "users_default_disabled_days" as const;
export const users_default_days_colors = "users_default_days_colors" as const;
export const users_default_overtime_multiplier =
  "users_default_overtime_multiplier" as const;
export const users = "users" as const;
export const months_input_disabled = "months_input_disabled" as const;
export const months_custom_hourly_rate = "months_custom_hourly_rate" as const;
export const months_custom_required_hours =
  "months_custom_required_hours" as const;
export const months_custom_disabled_days =
  "months_custom_disabled_days" as const;
export const months_custom_overtime_multiplier =
  "months_custom_overtime_multiplier" as const;
export const months = "months" as const;
export const holidays = "holidays" as const;
export const days_custom_hourly_rate = "days_custom_hourly_rate" as const;
export const days_custom_required_hours = "days_custom_required_hours" as const;
export const days_custom_overtime_multiplier =
  "days_custom_overtime_multiplier" as const;
export const days = "days" as const;
