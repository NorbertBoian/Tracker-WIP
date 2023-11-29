import { useEffect, useRef } from "react";
import { pastAndFutureType } from "../components/Month/Month";

import { getRateLimitedFunction } from "../functions/getRateLimitedFunction";
import { saveDatesInLongTermStorage } from "../functions/saveDatesInLongTermStorage";
import {
  datesChanged,
  savedStatusChanged,
} from "../slices/mainSlice/mainSlice";
import { store, useAppDispatch, useAppSelector } from "../store";
import { Dates, IDate } from "../utils/getEmptyDatesArray";
import { useStateRef } from "./useStateRef";

interface IDates {
  data: {
    dates?: {
      past: pastAndFutureType;
      present: Dates;
      future: pastAndFutureType;
    };
    focusedDay?: number;
    focusedField?: "top" | "bottom";
    cursors: {
      beganString: number[][];
      endedString: number[][];
      overtimeMultiplier: number[][];
      hourlyRate: number[][];
      requiredHours: number[][];
    };
  };
  isSuccess: boolean;
  isFetching: boolean;
}

const { dispatch } = store;

const changeDates = (dates: Dates) => {
  dispatch(
    datesChanged({
      dates: {
        data: dates,
        isFetching: false,
        isSuccess: true,
      },
    }),
  );
};

const initialCursorArray = Array.from({ length: 32 }, () => [0]);
const initialCursors = {
  beganString: initialCursorArray,
  endedString: initialCursorArray,
  overtimeMultiplier: initialCursorArray,
  hourlyRate: initialCursorArray,
  requiredHours: initialCursorArray,
};

const rateLimitedChangeDates = getRateLimitedFunction(changeDates, 100);
const rateLimitedChangeDatesInLongTermStorage = getRateLimitedFunction(
  saveDatesInLongTermStorage,
  300,
);

export const useMonthComponentState = () => {
  const updateMonthComponentState = useAppSelector(
    (state) => state.main.updateMonthComponentState,
  );
  const month = useAppSelector((state) => state.main.month);
  const year = useAppSelector((state) => state.main.year);
  const justGotDates = useRef(false);
  const dispatch = useAppDispatch();

  const [dates, setDates, datesRef] = useStateRef<IDates>(() => {
    const { dates } = store.getState().main;
    return {
      ...dates,
      data: {
        dates: dates.data
          ? { past: [], present: [...dates.data], future: [] }
          : undefined,
        focusedDay: undefined,
        focusedField: undefined,
        cursors: initialCursors,
      },
    };
  });

  const initialDates = useRef(dates);

  useEffect(() => {
    const { dates: newDates } = store.getState().main;
    if (updateMonthComponentState[0] === "keepHistory") {
      setDates((dates) => ({
        ...newDates,
        data: {
          ...dates.data,
          dates:
            newDates.data && dates.data?.dates
              ? {
                  past: [
                    {
                      value: dates.data.dates.present,
                      focusedDay: dates.data.focusedDay,
                      focusedField: dates.data.focusedField,
                    },
                    ...dates.data.dates.past,
                  ],
                  present: [...newDates.data],
                  future: [],
                }
              : undefined,
          focusedDay: undefined,
          focusedField: undefined,
        },
      }));
      justGotDates.current = true;
    } else {
      setDates((dates) => ({
        ...newDates,
        data: {
          ...dates.data,
          dates:
            newDates.data && dates.data
              ? {
                  past: [],
                  present: [...newDates.data],
                  future: [],
                }
              : undefined,

          focusedDay: undefined,
          focusedField: undefined,
        },
      }));
      justGotDates.current = true;
    }
  }, [setDates, updateMonthComponentState]);

  useEffect(() => {
    setDates((dates) => ({
      ...dates,
      data: {
        ...dates.data,
        focusedDay: undefined,
        focusedField: undefined,
      },
    }));
  }, [month, setDates, year]);

  const onlyFocusChangedRef = useRef(false);

  useEffect(() => {
    if (initialDates.current !== dates) {
      if (!onlyFocusChangedRef.current) {
        if (!justGotDates.current) {
          if (dates.data?.dates?.present) {
            const { email } = store.getState().main;
            if (email) dispatch(savedStatusChanged(false));
            rateLimitedChangeDates(dates.data.dates.present);
            rateLimitedChangeDatesInLongTermStorage(dates.data.dates.present);
          }
        } else {
          justGotDates.current = false;
        }
      } else {
        onlyFocusChangedRef.current = false;
      }
    }
  }, [dates, dispatch]);

  const undidOrRedidDatesRef = useRef((action: "undo" | "redo") => {
    const presentWillBecome = action === "undo" ? "future" : "past";
    const willBecomePresent = action === "undo" ? "past" : "future";
    setDates((dates) => {
      if (dates.data?.dates?.[willBecomePresent][0]) {
        const presentWillBecomeArray = [
          {
            value: dates.data.dates.present,
            focusedDay: dates.data.focusedDay,
            focusedField: dates.data.focusedField,
          },
          ...dates.data.dates[presentWillBecome],
        ];
        const newPresent = [
          ...dates.data.dates[willBecomePresent][0].value,
        ] as Dates;
        const newFocusedDay = dates.data.dates[willBecomePresent][0].focusedDay;
        const newFocusedField =
          dates.data.dates[willBecomePresent][0].focusedField;

        const willBecomePresentArray =
          dates.data.dates[willBecomePresent].slice(1);

        return {
          data: {
            ...dates.data,
            dates: {
              present: newPresent,
              future:
                presentWillBecome === "future"
                  ? presentWillBecomeArray
                  : willBecomePresentArray,
              past:
                willBecomePresent === "past"
                  ? willBecomePresentArray
                  : presentWillBecomeArray,
            },
            focusedDay: newFocusedDay,
            focusedField: newFocusedField,
          },
          isFetching: false,
          isSuccess: true,
        };
      } else return dates;
    });
  });

  const changeDatePropertyRef = useRef(
    <
      Key extends Exclude<
        keyof Exclude<
          Exclude<typeof dates.data, undefined>["dates"],
          undefined
        >["present"][number],
        "date"
      >,
    >(
      key: Key,
    ) => {
      return (
        value:
          | ({
              [key in keyof Omit<
                Exclude<
                  Exclude<typeof dates.data, undefined>["dates"],
                  undefined
                >["present"][number],
                "date" | "isHoliday"
              >]: { value: string; cursor?: number[] };
            } & { isHoliday: boolean })[Key]
          | ((
              value: Exclude<
                Exclude<typeof dates.data, undefined>["dates"],
                undefined
              >["present"][number][Key],
            ) => ({
              [key in keyof Omit<
                Exclude<
                  Exclude<typeof dates.data, undefined>["dates"],
                  undefined
                >["present"][number],
                "date" | "isHoliday"
              >]: { value: string; cursor?: number[] };
            } & { isHoliday: boolean })[Key]),
        day: number,
      ) => {
        setDates((dates) => {
          if (dates.data?.dates) {
            const computedValue =
              value instanceof Function
                ? value(dates.data.dates.present[day][key])
                : value;
            if (
              (typeof computedValue === "object" && "value" in computedValue
                ? computedValue.value
                : computedValue) === dates.data.dates.present[day][key]
            )
              return dates;
            const past = [
              {
                value: dates.data.dates.present,
                focusedDay: dates.data.focusedDay,
                focusedField: dates.data.focusedField,
              },
              ...dates.data.dates.past,
            ];
            const newDatesWithoutFirstEmpty = [
              ...dates.data.dates.present,
            ].slice(1) as IDate[];
            newDatesWithoutFirstEmpty[day - 1] = {
              ...newDatesWithoutFirstEmpty[day - 1],
              [key]:
                typeof computedValue === "object" && "value" in computedValue
                  ? computedValue.value
                  : computedValue,
            };

            const newCursors = { ...dates.data.cursors };
            if (
              typeof computedValue === "object" &&
              "cursor" in computedValue &&
              computedValue.cursor !== undefined &&
              key !== "isHoliday"
            ) {
              const castedKey = key as Exclude<Key, "isHoliday">;
              newCursors[castedKey] = [...newCursors[castedKey]];
              newCursors[castedKey][day] = computedValue.cursor;
            }

            return {
              ...dates,
              data: {
                ...dates.data,
                dates: {
                  past,
                  present: [{}, ...newDatesWithoutFirstEmpty],
                  future: [],
                },
                cursors: newCursors,
                isFetching: false,
                isSuccess: true,
              },
            };
          } else return dates;
        });
      };
    },
  );

  const handleCtrlZRef = useRef((event: KeyboardEvent) => {
    if (event.target instanceof HTMLElement)
      if (
        (event.target.tagName !== "INPUT" || event.target.dataset.input) &&
        event.ctrlKey &&
        event.code === "KeyZ"
      ) {
        event.preventDefault();
        undidOrRedidDatesRef.current("undo");
      } else if (
        (event.target.tagName !== "INPUT" || event.target.dataset.input) &&
        event.ctrlKey &&
        event.code === "KeyY"
      ) {
        event.preventDefault();
        undidOrRedidDatesRef.current("redo");
      }
  });

  const daysWrapperRef = useRef<HTMLOListElement | null>(null);

  const setFocusRef = useRef(
    (
      direction: string,
      gridRowLength: number,
      isMonthSettingsMenuOpen: boolean,
      numberOfDays: number,
    ) => {
      onlyFocusChangedRef.current = true;
      setDates((dates) => {
        if (dates.data) {
          const { focusedDay, focusedField } = dates.data;
          if (focusedDay !== undefined && focusedField) {
            const grid: (readonly [number, "top" | "bottom"])[][] = [];
            let focusedFieldRow = 0;
            let focusedFieldColumn = 0;
            let count = 0;
            let row = 0;
            while (count < numberOfDays) {
              const rowLength =
                isMonthSettingsMenuOpen && row < 4
                  ? gridRowLength - 1
                  : gridRowLength;
              const newRowLength =
                numberOfDays - count < rowLength
                  ? numberOfDays - count
                  : rowLength;

              const columns = Array.from(
                { length: newRowLength },
                (v, column) => {
                  if (focusedDay === count) {
                    focusedFieldRow = row * 2 + +(focusedField === "bottom");
                    focusedFieldColumn = column;
                  }
                  return count++;
                },
              );
              grid.push(columns.map((column) => [column, "top"] as const));
              grid.push(columns.map((column) => [column, "bottom"] as const));
              row++;
            }
            const focusedFieldHasFieldDownward =
              grid?.[focusedFieldRow + 1]?.[focusedFieldColumn];
            const focusedFieldHasFieldUpward =
              grid?.[focusedFieldRow - 1]?.[focusedFieldColumn];
            const focusedFieldHasFieldLeftward =
              grid?.[focusedFieldRow]?.[focusedFieldColumn - 1];
            const focusedFieldHasFieldRightward =
              grid?.[focusedFieldRow]?.[focusedFieldColumn + 1];
            switch (direction) {
              case "ArrowDown":
                if (focusedFieldHasFieldDownward) {
                  const [newFocusedDay, newFocusedField] =
                    focusedFieldHasFieldDownward;
                  return {
                    ...dates,
                    data: {
                      ...dates.data,
                      focusedField: newFocusedField,
                      focusedDay: newFocusedDay,
                    },
                  };
                }
                break;
              case "ArrowUp":
                if (focusedFieldHasFieldUpward) {
                  const [newFocusedDay, newFocusedField] =
                    focusedFieldHasFieldUpward;
                  return {
                    ...dates,
                    data: {
                      ...dates.data,
                      focusedField: newFocusedField,
                      focusedDay: newFocusedDay,
                    },
                  };
                }
                break;
              case "ArrowLeft":
                if (focusedFieldHasFieldLeftward) {
                  const [newFocusedDay, newFocusedField] =
                    focusedFieldHasFieldLeftward;
                  return {
                    ...dates,
                    data: {
                      ...dates.data,
                      focusedField: newFocusedField,
                      focusedDay: newFocusedDay,
                    },
                  };
                }
                break;
              case "ArrowRight":
                if (focusedFieldHasFieldRightward) {
                  const [newFocusedDay, newFocusedField] =
                    focusedFieldHasFieldRightward;
                  return {
                    ...dates,
                    data: {
                      ...dates.data,
                      focusedField: newFocusedField,
                      focusedDay: newFocusedDay,
                    },
                  };
                }
                break;
            }
          }
          return dates;
        } else return dates;
      });
    },
  );

  const monthArrowNavHandlerRef = useRef(
    (event: React.KeyboardEvent<HTMLOListElement>) => {
      if (
        daysWrapperRef.current &&
        event.key.includes("Arrow") === true &&
        !event.altKey &&
        event.target instanceof HTMLInputElement &&
        !event.target.dataset.daySettingInput &&
        !event.target.dataset.monthSettingInput
      ) {
        const monthChildrenElements = [
          ...daysWrapperRef.current.children,
        ] as HTMLElement[];
        const isMonthSettingsMenuOpen =
          !!monthChildrenElements[0].dataset.monthSettings;
        const dayElements = isMonthSettingsMenuOpen
          ? monthChildrenElements.slice(1)
          : monthChildrenElements;
        const firstDayOffset = monthChildrenElements[1].offsetTop;
        const firstDayInSecondRow = monthChildrenElements.findIndex(
          (day) => day.offsetTop > firstDayOffset,
        );
        const numberOfDays = dayElements.length;
        const rowLength =
          firstDayInSecondRow === -1 ? dayElements.length : firstDayInSecondRow;
        event.preventDefault();
        setFocusRef.current(
          event.key,
          rowLength,
          isMonthSettingsMenuOpen,
          numberOfDays,
        );
      } else if (
        event.altKey &&
        (event.key === "ArrowLeft" || event.key === "ArrowRight")
      ) {
        if (
          event.target instanceof HTMLInputElement &&
          event.target.selectionEnd !== null &&
          event.target.selectionStart !== null
        )
          if (event.key === "ArrowLeft") {
            event.target.setSelectionRange(
              Math.max(event.target.selectionStart - 1, 0),
              Math.max(event.target.selectionStart - 1, 0),
            );
          } else {
            event.target.setSelectionRange(
              event.target.selectionEnd + 1,
              event.target.selectionEnd + 1,
            );
          }
        event.preventDefault();
      }
    },
  );

  const handleFocusRef = useRef((event: React.FocusEvent<HTMLOListElement>) => {
    const eventTargetDayIndex = event.target.dataset.dayIndex;
    const eventTargetField = event.target.dataset.input;
    if (
      (eventTargetField === "top" || eventTargetField === "bottom") &&
      eventTargetDayIndex !== undefined &&
      (datesRef.current.data.focusedDay !== +eventTargetDayIndex ||
        datesRef.current.data.focusedField !== eventTargetField)
    ) {
      onlyFocusChangedRef.current = true;
      setDates((dates) => ({
        ...dates,
        data: {
          ...dates.data,
          focusedField: eventTargetField,
          focusedDay: +eventTargetDayIndex,
        },
      }));
    }
  });

  useEffect(() => {
    const handleCtrlZ = handleCtrlZRef.current;
    window.document.body.addEventListener("keydown", handleCtrlZ);
    return () => {
      window.document.body.removeEventListener("keydown", handleCtrlZ);
    };
  }, [handleCtrlZRef]);

  return {
    daysWrapperRef,
    changeDatePropertyRef,
    dates,
    monthArrowNavHandlerRef,
    handleFocusRef,
  };
};

export type setStringRef = React.MutableRefObject<
  (
    value:
      | {
          value: string;
          cursor?: number[];
        }
      | ((value: string) => {
          value: string;
          cursor?: number[];
        }),
    day: number,
  ) => void
>;

export type setBooleanRef = React.MutableRefObject<
  (value: boolean | ((value: boolean) => boolean), day: number) => void
>;
