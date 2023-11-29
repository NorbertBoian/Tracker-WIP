import {
  languageCodesArray,
  languageCodeType,
  monthNumberType,
} from "../../../constants/constants";
import { emptyStringsLanguageObject } from "../../../languages/emptyStrings";
import { Dates } from "../../../utils/getEmptyDatesArray";
import {
  applicationSettingsWeekdaysType,
  monthSettingsType,
} from "../../../utils/typedLocalStorage/typedLocalStorage";

export type pastAndFutureType = {
  value: Dates;
  focusedDay: number | undefined;
  focusedField: "top" | "bottom" | undefined;
}[];

const clientPreferredLanguages = navigator.languages;
export const clientPreferredLanguage = clientPreferredLanguages
  .find((clientLanguageCode) =>
    languageCodesArray.find(
      (languageCode) => clientLanguageCode.slice(0, 2) === languageCode,
    ),
  )
  ?.slice(0, 2) as languageCodeType | undefined;

export const getMainSliceInitialState = () => {
  const initialYear = new Date().getFullYear();
  const initialMonth = new Date().getMonth() as monthNumberType;

  const initialState = {
    languageCode: {
      data: clientPreferredLanguage ?? ("en" as languageCodeType | undefined),
      isFetching: false,
      isSuccess: true,
    },
    languageObject: {
      data: emptyStringsLanguageObject,
      isFetching: true,
      isSuccess: false,
    },
    year: initialYear,
    month: initialMonth,
    dates: {
      data: undefined as undefined | Dates,
      isFetching: true,
      isSuccess: false,
    },
    autosaveInterval: {
      data: undefined as undefined | number,
      isFetching: true,
      isSuccess: false,
    },
    displayedCurrency: {
      data: undefined as undefined | string,
      isFetching: true,
      isSuccess: false,
    },
    applicationSettings: {
      data: undefined as
        | undefined
        | {
            weekdays: applicationSettingsWeekdaysType;
            hourlyRate: string;
            overtimeMultiplier: string;
          },
      isFetching: true,
      isSuccess: false,
    },
    monthSettings: {
      data: undefined as undefined | monthSettingsType,
      isFetching: true,
      isSuccess: false,
    },
    username: false as false | string,
    email: undefined as undefined | false | string,
    lockedInputs: {
      data: undefined as undefined | boolean,
      isFetching: true,
      isSuccess: false,
    },
    showDaysStats: false,
    monthCreatedAt: {
      data: undefined as undefined | number,
      isFetching: true,
      isSuccess: false,
    },
    savedStatus: true,
    streamClientId: window.crypto.randomUUID(),
    updateMonthComponentState: [] as unknown[],
  };
  return initialState;
};

export type mainSliceInitialState = ReturnType<typeof getMainSliceInitialState>;
