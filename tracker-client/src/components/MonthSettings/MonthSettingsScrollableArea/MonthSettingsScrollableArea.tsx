import { HourlyRateInput } from "./HourlyRateInput/HourlyRateInput";
import { MonthSettingsExplanations } from "./MonthSettingsExplanations/MonthSettingsExplanations";
import {} from "./MonthSettingsScrollableArea.module.css";
import { OvertimeMultiplierInput } from "./OvertimeMultiplierInput/OvertimeMultiplierInput";
import { scrollableArea } from "./MonthSettingsScrollableArea.module.css";
import { MonthDaySettings } from "../MonthDaySettings/MonthDaySettings";
import { store, useAppDispatch, useAppSelector } from "../../../store";

import { useMonthDefaultSettings } from "../../../hooks/useMonthDefaultSettings";
import { englishWeekdaysArray } from "../../../constants/constants";
import { monthSettingChanged } from "../../../slices/monthSettingsSlice";
import { useEffect, useRef } from "react";

const englishWeekdaysMondayFirst = [
  ...englishWeekdaysArray.slice(1),
  englishWeekdaysArray[0],
];

interface IProps {
  hourlyRateInputRef: React.RefObject<HTMLInputElement>;
}

export const MonthSettingsScrollableArea = ({ hourlyRateInputRef }: IProps) => {
  const languageObject = useAppSelector((state) => state.main.languageObject);
  const {
    weekdaysArray,
    hourlyRate: hourlyRateLocalizedString,
    overtimeMultiplier: overtimeMultiplierLocalizedString,
  } = languageObject.data;

  const weekDaysMondayFirst = [...weekdaysArray.slice(1), weekdaysArray[0]];

  const hourlyRate = useAppSelector((state) => state.monthSettings.hourlyRate);
  const overtimeMultiplier = useAppSelector(
    (state) => state.monthSettings.overtimeMultiplier,
  );
  const cursors = useAppSelector((state) => state.monthSettings.cursors);

  const dispatch = useAppDispatch();

  const hourlyRateChangeHandlerRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { hourlyRate } = store.getState().monthSettings;
        dispatch(
          monthSettingChanged({
            property: "hourlyRate",
            value: value(hourlyRate),
          }),
        );
      } else {
        dispatch(monthSettingChanged({ property: "hourlyRate", value }));
      }
    },
  );

  const overtimeMultiplierChangeHandlerRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { overtimeMultiplier } = store.getState().monthSettings;
        dispatch(
          monthSettingChanged({
            property: "overtimeMultiplier",
            value: value(overtimeMultiplier),
          }),
        );
      } else {
        dispatch(
          monthSettingChanged({ property: "overtimeMultiplier", value }),
        );
      }
    },
  );

  const overtimeMultiplierInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (hourlyRateInputRef.current) {
      dispatch(
        monthSettingChanged({
          property: "hourlyRateValidity",
          value: hourlyRateInputRef.current?.validity.valid,
        }),
      );
    }
  }, [dispatch, hourlyRate, hourlyRateInputRef]);

  useEffect(() => {
    if (overtimeMultiplierInputRef.current) {
      dispatch(
        monthSettingChanged({
          property: "overtimeMultiplierValidity",
          value: overtimeMultiplierInputRef.current?.validity.valid,
        }),
      );
    }
  }, [dispatch, overtimeMultiplier]);

  const { data: monthDefaultSettings, isSuccess } = useMonthDefaultSettings();

  const {
    hourlyRate: hourlyRateCursor,
    overtimeMultiplier: overtimeMultiplierCursor,
    weekdays: weekdaysCursors,
  } = cursors;

  if (monthDefaultSettings && isSuccess) {
    const {
      monthDefaultRequiredHours,
      monthDefaultOvertimeMultiplier,
      monthDefaultHourlyRate,
      monthDefaultDisabledDays,
    } = monthDefaultSettings;

    return (
      <section className={scrollableArea}>
        <HourlyRateInput
          refProp={hourlyRateInputRef}
          value={hourlyRate}
          placeholder={monthDefaultHourlyRate}
          cursor={hourlyRateCursor}
          setValueRef={hourlyRateChangeHandlerRef}
          descriptionString={hourlyRateLocalizedString}
        />
        <OvertimeMultiplierInput
          refProp={overtimeMultiplierInputRef}
          value={overtimeMultiplier}
          placeholder={monthDefaultOvertimeMultiplier}
          cursor={overtimeMultiplierCursor}
          setValueRef={overtimeMultiplierChangeHandlerRef}
          descriptionString={overtimeMultiplierLocalizedString}
        />
        <MonthSettingsExplanations />
        {weekDaysMondayFirst.map((weekDay, i) => (
          <MonthDaySettings
            key={weekDay}
            englishDayName={englishWeekdaysMondayFirst[i]}
            dayName={weekDay}
            cursor={weekdaysCursors[englishWeekdaysMondayFirst[i]]}
            monthDefaultDisabledDay={
              monthDefaultDisabledDays[englishWeekdaysMondayFirst[i]]
            }
            languageObject={languageObject.data}
            requiredHoursPlaceholder={
              monthDefaultRequiredHours[englishWeekdaysMondayFirst[i]]
            }
          />
        ))}
      </section>
    );
  } else return <div>Loading...</div>;
};
