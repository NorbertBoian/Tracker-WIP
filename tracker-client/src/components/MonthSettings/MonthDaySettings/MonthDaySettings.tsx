import { useCallback, useEffect, useRef } from "react";
import { requiredHoursRegex } from "../../../../../shared/constants";
import { englishWeekdayType } from "../../../constants/constants";
import { languageObjectType } from "../../../languages/en";
import { monthSettingsWeekdayPropertyChanged } from "../../../slices/monthSettingsSlice";
import { store, useAppDispatch, useAppSelector } from "../../../store";
import { DaySettingsBar } from "../../Shared/DaySettingsBar/DaySettingsBar";
import MonthDaySettingsClasses from "./MonthDaySettings.module.css";

const {
  disabledDay: disabledDayClass,
  daySettingsBarComponent,
  ...customClasses
} = MonthDaySettingsClasses;

interface IProps {
  dayName: string;
  languageObject: languageObjectType;
  requiredHoursPlaceholder: string;
  cursor: number[];
  monthDefaultDisabledDay: boolean;
  englishDayName: englishWeekdayType;
}

export const MonthDaySettings = ({
  dayName,
  languageObject,
  cursor,
  monthDefaultDisabledDay,
  requiredHoursPlaceholder,
  englishDayName,
}: IProps) => {
  const { disabledDay: customDisabledDay, requiredHours } = useAppSelector(
    (state) => state.monthSettings.weekdays[englishDayName],
  );

  const dispatch = useAppDispatch();

  const requiredHoursChangeHandlerRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { weekdays } = store.getState().monthSettings;
        dispatch(
          monthSettingsWeekdayPropertyChanged({
            property: "requiredHours",
            value: value(weekdays[englishDayName].requiredHours),
            weekday: englishDayName,
          }),
        );
      } else {
        dispatch(
          monthSettingsWeekdayPropertyChanged({
            property: "requiredHours",
            value,
            weekday: englishDayName,
          }),
        );
      }
    },
  );

  const disabledDay =
    customDisabledDay !== undefined
      ? customDisabledDay
      : monthDefaultDisabledDay;

  const toggleDisabledDay = useCallback(() => {
    const { weekdays } = store.getState().monthSettings;

    dispatch(
      monthSettingsWeekdayPropertyChanged({
        weekday: englishDayName,
        property: "disabledDay",
        value:
          weekdays[englishDayName].disabledDay === undefined
            ? !monthDefaultDisabledDay
            : !weekdays[englishDayName].disabledDay,
      }),
    );
  }, [dispatch, englishDayName, monthDefaultDisabledDay]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      dispatch(
        monthSettingsWeekdayPropertyChanged({
          weekday: englishDayName,
          property: "requiredHoursValidity",
          value: inputRef.current?.validity.valid,
        }),
      );
    }
  }, [dispatch, englishDayName, requiredHours]);

  return (
    <fieldset
      className={`${daySettingsBarComponent} ${
        disabledDay ? disabledDayClass : ""
      }`}
    >
      <DaySettingsBar
        dayName={dayName}
        disabledDay={disabledDay}
        languageObject={languageObject}
        inputRef={inputRef}
        monthInput={true}
        requiredHoursValue={requiredHours}
        requiredHoursInputOptions={{
          maxLength: 2,
          pattern: requiredHoursRegex.toString().slice(1, -1),
        }}
        requiredHoursPlaceholder={requiredHoursPlaceholder}
        requiredHoursChangeHandlerRef={requiredHoursChangeHandlerRef}
        cursor={cursor}
        toggleDisabledDay={toggleDisabledDay}
        customClasses={customClasses}
      />
    </fieldset>
  );
};
