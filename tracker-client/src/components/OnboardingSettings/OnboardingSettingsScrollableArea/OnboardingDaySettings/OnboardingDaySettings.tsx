import { DaySettingsBar } from "../../../Shared/DaySettingsBar/DaySettingsBar";
import onboardingDaySettingsClasses from "./OnboardingDaySettings.module.css";
import { englishWeekdayType } from "../../../../constants/constants";
import { useCallback, useEffect, useRef } from "react";
import { store, useAppDispatch, useAppSelector } from "../../../../store";
import {
  applicationSettingsWeekdayDisabledDayToggled,
  applicationSettingsWeekdayPropertyChanged,
} from "../../../../slices/applicationSettingsSlice";
import { requiredHoursRegex } from "../../../../../../shared/constants";

const {
  daySettingsBarWrapper,
  disabledDay: disabledDayClass,
  ...daySettingsBarCustomClasses
} = onboardingDaySettingsClasses;

interface IProps {
  dayName: string;
  cursor: number[];
  englishDayName: englishWeekdayType;
  requiredHoursPlaceholder: string;
}

export const OnboardingDaySettings = ({
  dayName,
  englishDayName,
  cursor,
  requiredHoursPlaceholder,
}: IProps) => {
  const dispatch = useAppDispatch();

  const weekdays = useAppSelector(
    (state) => state.applicationSettings.weekdays,
  );
  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );

  const { requiredHours, disabledDay } = weekdays[englishDayName];

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      dispatch(
        applicationSettingsWeekdayPropertyChanged({
          weekday: englishDayName,
          property: "requiredHoursValidity",
          value: inputRef.current?.validity.valid,
        }),
      );
    }
  }, [dispatch, englishDayName, requiredHours]);

  const requiredHoursChangeHandlerRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { requiredHours } =
          store.getState().applicationSettings.weekdays[englishDayName];
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "requiredHours",
            value: value(requiredHours),
          }),
        );
      } else {
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "requiredHours",
            value,
          }),
        );
      }
    },
  );

  const toggleDisabledDay = useCallback(() => {
    dispatch(applicationSettingsWeekdayDisabledDayToggled(englishDayName));
  }, [dispatch, englishDayName]);

  return (
    <fieldset
      className={`${daySettingsBarWrapper} ${
        disabledDay ? disabledDayClass : ""
      }`}
    >
      <DaySettingsBar
        inputRef={inputRef}
        dayName={dayName}
        requiredHoursInputOptions={{
          maxLength: 2,
          pattern: requiredHoursRegex.toString().slice(1, -1),
        }}
        disabledDay={disabledDay}
        cursor={cursor}
        requiredHoursValue={requiredHours}
        languageObject={languageObject.data}
        requiredHoursPlaceholder={requiredHoursPlaceholder}
        customClasses={daySettingsBarCustomClasses}
        requiredHoursChangeHandlerRef={requiredHoursChangeHandlerRef}
        toggleDisabledDay={toggleDisabledDay}
      />
    </fieldset>
  );
};
