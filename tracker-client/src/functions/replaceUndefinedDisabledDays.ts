import {
  englishWeekdaysArray,
  englishWeekdayType,
} from "../constants/constants";

type weekdays = {
  [weekday in englishWeekdayType]: {
    disabledDay: boolean | undefined;
    [key: string]: unknown;
  };
};

type fallbackWeekdays = {
  [weekday in englishWeekdayType]: {
    disabledDay: boolean;
    [key: string]: unknown;
  };
};

export const replaceUndefinedDisabledDays = <Weekdays extends weekdays>(
  weekdays: Weekdays,
  fallbackWeekdays: fallbackWeekdays,
) => {
  const replacedWeekdays = {} as Weekdays;

  for (const weekday of englishWeekdaysArray) {
    const disabledDay =
      weekdays[weekday].disabledDay !== undefined
        ? weekdays[weekday].disabledDay
        : fallbackWeekdays[weekday].disabledDay;

    Object.assign(replacedWeekdays, {
      [weekday]: {
        ...weekdays[weekday],
        disabledDay,
      },
    });
  }
  return replacedWeekdays;
};
