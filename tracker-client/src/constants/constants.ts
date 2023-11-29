export const monday = "monday" as const;
export const tuesday = "tuesday" as const;
export const wednesday = "wednesday" as const;
export const thursday = "thursday" as const;
export const friday = "friday" as const;
export const saturday = "saturday" as const;
export const sunday = "sunday" as const;

export const January = "January" as const;
export const February = "February" as const;
export const March = "March" as const;
export const April = "April" as const;
export const May = "May" as const;
export const June = "June" as const;
export const July = "July" as const;
export const August = "August" as const;
export const September = "September" as const;
export const October = "October" as const;
export const November = "November" as const;
export const December = "December" as const;

export const englishMonthsArray = [
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December,
] as const;

export const englishWeekdaysArray = [
  sunday,
  monday,
  tuesday,
  wednesday,
  thursday,
  friday,
  saturday,
] as const;

export type englishWeekdayType = typeof englishWeekdaysArray[number];

export type englishMonthNameType = typeof englishMonthsArray[number];

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

// prettier-ignore
export type dateNumberType = 1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31;

export type monthNumberType = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type languageCodeType = keyof typeof languageNames;

export const emptyObject = {};

export const languageCodesArray = Object.keys(
  languageNames,
) as languageCodeType[];

export const languageNamesArray = Object.values(languageNames);

export type languageNameType = typeof languageNamesArray[number];

const defaultGrayColor: [number, number, number] = [0, 0.01, 0.81];
const defaultRedColor: [number, number, number] = [49, 1, 0.9];

export const defaultDaysColors = {
  [monday]: defaultGrayColor,
  [tuesday]: defaultGrayColor,
  [wednesday]: defaultGrayColor,
  [thursday]: defaultGrayColor,
  [friday]: defaultGrayColor,
  [saturday]: defaultRedColor,
  [sunday]: defaultRedColor,
} as const;

export const requiredHoursPlaceholders = {
  [monday]: "8",
  [tuesday]: "8",
  [wednesday]: "8",
  [thursday]: "8",
  [friday]: "8",
  [saturday]: "0",
  [sunday]: "0",
};

export const hourlyRatePlaceholder = "45";
export const overtimeMultiplierPlaceholder = "2.25";
export const displayedCurrencyPlaceholder = "¤";
