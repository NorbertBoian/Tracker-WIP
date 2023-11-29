import {
  createRef,
  MouseEvent,
  useRef,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  createElement,
} from "react";
import {
  dateNumberType,
  englishWeekdaysArray,
} from "../../constants/constants";
import { useAnimation } from "../../hooks/useAnimation";
import { useMonthComponentState } from "../../hooks/useMonthComponentState";
import { useMonthData } from "../../hooks/useMonthData";
import { userDefaultDaysColorsType } from "../../slices/apiSliceTypes";
import { applicationSettingsBlankWeekdays } from "../../slices/mainSlice/functions/getApplicationSettingsInitialState";
import { useAppSelector } from "../../store";
import { Dates, IDate } from "../../utils/getEmptyDatesArray";
import { applicationSettingsWeekdaysType } from "../../utils/typedLocalStorage/typedLocalStorage";
import { Day, DayWrapper } from "../Day/Day";
import {
  MonthSettings,
  MonthSettingsAndDaysWrapper,
} from "../MonthSettings/MonthSettings";
import { AnimateDays } from "./AnimateDays";
import { getDaysEnabledFirst } from "./functions/getDaysEnabledFirst";
import { getDaysEnabledStatus } from "./functions/getDaysEnabledStatus";
import { getEnabledDays } from "./functions/getEnabledDays";
import { ListItem } from "./ListItem";
import { daysWrapper } from "./Month.module.css";

export type pastAndFutureType = {
  value: Dates;
  focusedDay: number | undefined;
  focusedField: "top" | "bottom" | undefined;
}[];

interface IProps {
  showMonthSettings: boolean | 2;
  setShowMonthSettings: (boolean: boolean | 2) => void;
  mouseDownHandlerRef: React.MutableRefObject<(event: MouseEvent) => void>;
  overlayRef: React.MutableRefObject<HTMLFormElement | null>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
  showMonthSettingsRef: React.MutableRefObject<boolean | 2>;
}

const getGuestDayNameColors = (
  applicationSettingsWeekdays?: applicationSettingsWeekdaysType,
) => {
  const weekdays =
    applicationSettingsWeekdays ?? applicationSettingsBlankWeekdays;
  const dayNameColors = {} as userDefaultDaysColorsType;
  for (const weekday of englishWeekdaysArray) {
    Object.assign(dayNameColors, { [weekday]: weekdays[weekday].color });
  }
  return dayNameColors;
};

export const Month = memo(
  ({
    showMonthSettings,
    closeLastOpenedModalRef,
    setShowMonthSettings,
    mouseDownHandlerRef,
    showMonthSettingsRef,
    overlayRef,
  }: IProps) => {
    const month = useAppSelector((state) => state.main.month);
    const year = useAppSelector((state) => state.main.year);
    const email = useAppSelector((state) => state.main.email);
    const lockedInputs = useAppSelector((state) => state.main.lockedInputs);
    const languageObject = useAppSelector((state) => state.main.languageObject);
    const applicationSettings = useAppSelector(
      (state) => state.main.applicationSettings,
    );

    const {
      changeDatePropertyRef,
      dates,
      monthArrowNavHandlerRef,
      handleFocusRef,
      daysWrapperRef,
    } = useMonthComponentState();

    const { combinedMonthSettings } = useMonthData();

    const enabledDays =
      combinedMonthSettings.data?.monthlyDisabledDays && dates.data?.dates
        ? getEnabledDays(
            dates.data.dates.present,
            combinedMonthSettings.data.monthlyDisabledDays,
          )
        : undefined;

    const daysRefsRef = useRef(
      Array.from({ length: 32 }, () => createRef<HTMLLIElement>()),
    );

    const { weekdaysArray, monthsArray } = languageObject.data;

    const combinedMonthSettingsData = combinedMonthSettings.data;

    const setBeganStringValueRef = useRef(
      changeDatePropertyRef.current("beganString"),
    );

    const setEndedStringValueRef = useRef(
      changeDatePropertyRef.current("endedString"),
    );

    const setIsHolidayRef = useRef(changeDatePropertyRef.current("isHoliday"));

    const setHourlyRateRef = useRef(
      changeDatePropertyRef.current("hourlyRate"),
    );

    const setOvertimeMultiplierRef = useRef(
      changeDatePropertyRef.current("overtimeMultiplier"),
    );
    const setHoursRequiredRef = useRef(
      changeDatePropertyRef.current("requiredHours"),
    );

    const loaded =
      languageObject.data &&
      // languageObject.isSuccess &&
      combinedMonthSettings.isSuccess &&
      combinedMonthSettingsData &&
      dates.data &&
      dates.isSuccess &&
      enabledDays;

    const { focusedDay, focusedField, cursors } = dates.data;
    const guestDayNameColors = getGuestDayNameColors(
      applicationSettings.data?.weekdays,
    );
    const dayNameColors = guestDayNameColors;

    const {
      beganString: beganStringCursors,
      endedString: endedStringCursors,
      overtimeMultiplier: overtimeMultiplierCursors,
      hourlyRate: hourlyRateCursors,
      requiredHours: requiredHoursCursors,
    } = cursors;
    // if (dates.data.dates?.present)
    // console.log(dates.data.dates.present.map((date) => date.date));

    const renderDays = () => {
      if (loaded) {
        return enabledDays.map((date, dayIndex) => {
          const dateObj = new Date(date.date);
          const weekdayIndex = dateObj.getDay();
          const dayNumber = dateObj.getDate() as dateNumberType;
          const {
            isHoliday,
            beganString,
            endedString,
            hourlyRate: dailyHourlyRate,
            overtimeMultiplier: dailyOvertimeMultiplier,
            requiredHours: dailyHoursRequired,
          } = date;

          const {
            monthlyHourlyRate,
            monthlyOvertimeMultiplier,
            monthlyRequiredHours,
          } = combinedMonthSettingsData;

          const hourlyRate =
            dailyHourlyRate !== "" ? dailyHourlyRate : monthlyHourlyRate;

          const overtimeMultiplier =
            dailyOvertimeMultiplier !== ""
              ? dailyOvertimeMultiplier
              : monthlyOvertimeMultiplier;

          const hoursRequired =
            dailyHoursRequired !== ""
              ? dailyHoursRequired
              : monthlyRequiredHours[englishWeekdaysArray[weekdayIndex]];

          const weekdayString = weekdaysArray[weekdayIndex];
          const dateString = `${dayNumber} ${monthsArray[month]}`;

          return (
            <li key={date.date} ref={daysRefsRef.current[dayNumber]}>
              <Day
                isHoliday={isHoliday}
                setIsHolidayRef={setIsHolidayRef}
                firstInputValue={beganString}
                secondInputValue={endedString}
                languageObject={languageObject.data}
                beganStringCursor={beganStringCursors[dayNumber]}
                endedStringCursor={endedStringCursors[dayNumber]}
                overtimeMultiplierCursor={overtimeMultiplierCursors[dayNumber]}
                hourlyRateCursor={hourlyRateCursors[dayNumber]}
                requiredHoursCursor={requiredHoursCursors[dayNumber]}
                firstInputSetValueRef={setBeganStringValueRef}
                secondInputSetValueRef={setEndedStringValueRef}
                hourlyRate={dailyHourlyRate}
                hourlyRatePlaceholder={hourlyRate}
                setHourlyRateRef={setHourlyRateRef}
                overtimeMultiplier={dailyOvertimeMultiplier}
                overtimeMultiplierPlaceholder={overtimeMultiplier}
                setOvertimeMultiplierRef={setOvertimeMultiplierRef}
                hoursRequired={dailyHoursRequired}
                hoursRequiredPlaceholder={hoursRequired}
                setHoursRequiredRef={setHoursRequiredRef}
                lockedInputs={!!lockedInputs.data}
                focused={focusedDay === dayIndex ? focusedField : false}
                dayIndex={dayIndex}
                weekdayString={weekdayString}
                dateString={dateString}
                dayNumber={dayNumber}
                firstInputPlaceholder="00:00"
                secondInputPlaceholder="00:00"
                dayNameColor={dayNameColors[englishWeekdaysArray[weekdayIndex]]}
              />
            </li>
          );
        });
      } else return <div>Loading...</div>;
    };

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <ol
        ref={daysWrapperRef}
        onKeyDown={monthArrowNavHandlerRef.current}
        className={daysWrapper}
        onFocus={handleFocusRef.current}
      >
        <MonthSettingsAndDaysWrapper
          closeLastOpenedModalRef={closeLastOpenedModalRef}
          showMonthSettings={showMonthSettings}
          showMonthSettingsRef={showMonthSettingsRef}
          setShowMonthSettings={setShowMonthSettings}
          mouseDownHandlerRef={mouseDownHandlerRef}
          overlayRef={overlayRef}
          daysWrapperRef={daysWrapperRef}
          month={month}
          year={year}
          email={email}
          days={renderDays()}
        />
      </ol>
    );
  },
);

Month.displayName = "Month";
