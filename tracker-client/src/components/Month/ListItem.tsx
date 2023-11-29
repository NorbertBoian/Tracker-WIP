import { memo } from "react";
import {
  setBooleanRef,
  setStringRef,
} from "../../hooks/useMonthComponentState";
import { languageObjectType } from "../../languages/en";
import { Day } from "../Day/Day";

interface IProps {
  weekdayString: string;
  dateString: string;
  isHoliday: boolean;
  setIsHolidayRef: setBooleanRef;
  firstInputValue: string;
  secondInputValue: string;
  hourlyRate: string;
  dayIndex?: number;
  dayNumber?: number;
  beganStringCursor: number[];
  endedStringCursor: number[];
  overtimeMultiplierCursor: number[];
  hourlyRateCursor: number[];
  requiredHoursCursor: number[];
  dayValidity?: boolean;
  focused?: "top" | "bottom" | false;
  hourlyRatePlaceholder: string;
  setHourlyRateRef: setStringRef;
  overtimeMultiplier: string;
  overtimeMultiplierPlaceholder: string;
  setOvertimeMultiplierRef: setStringRef;
  hoursRequired: string;
  hoursRequiredPlaceholder: string;
  setHoursRequiredRef: setStringRef;
  lockedInputs?: boolean;
  firstInputSetValueRef: setStringRef;
  secondInputSetValueRef: setStringRef;
  dayNameColor: string | [number, number, number];
  languageObject: languageObjectType;
  refProp: React.MutableRefObject<null | HTMLLIElement>;
}

export const ListItem = memo(
  ({
    beganStringCursor,
    endedStringCursor,
    overtimeMultiplierCursor,
    hourlyRateCursor,
    requiredHoursCursor,
    weekdayString,
    dayNumber,
    dateString,
    isHoliday,
    setIsHolidayRef,
    firstInputValue,
    secondInputValue,
    focused,
    dayIndex,
    languageObject,
    lockedInputs,
    hourlyRate,
    hourlyRatePlaceholder,
    setHourlyRateRef,
    overtimeMultiplier,
    overtimeMultiplierPlaceholder,
    setOvertimeMultiplierRef,
    hoursRequired,
    hoursRequiredPlaceholder,
    setHoursRequiredRef,
    firstInputSetValueRef,
    secondInputSetValueRef,
    dayNameColor,
    refProp,
  }: IProps) => {
    return (
      <li ref={refProp}>
        <Day
          isHoliday={isHoliday}
          setIsHolidayRef={setIsHolidayRef}
          firstInputValue={firstInputValue}
          secondInputValue={secondInputValue}
          languageObject={languageObject}
          beganStringCursor={beganStringCursor}
          endedStringCursor={endedStringCursor}
          overtimeMultiplierCursor={overtimeMultiplierCursor}
          hourlyRateCursor={hourlyRateCursor}
          requiredHoursCursor={requiredHoursCursor}
          firstInputSetValueRef={firstInputSetValueRef}
          secondInputSetValueRef={secondInputSetValueRef}
          hourlyRate={hourlyRate}
          hourlyRatePlaceholder={hourlyRatePlaceholder}
          setHourlyRateRef={setHourlyRateRef}
          overtimeMultiplier={overtimeMultiplier}
          overtimeMultiplierPlaceholder={overtimeMultiplierPlaceholder}
          setOvertimeMultiplierRef={setOvertimeMultiplierRef}
          hoursRequired={hoursRequired}
          hoursRequiredPlaceholder={hoursRequiredPlaceholder}
          setHoursRequiredRef={setHoursRequiredRef}
          lockedInputs={lockedInputs}
          focused={focused}
          dayIndex={dayIndex}
          weekdayString={weekdayString}
          dateString={dateString}
          dayNumber={dayNumber}
          firstInputPlaceholder="00:00"
          secondInputPlaceholder="00:00"
          dayNameColor={dayNameColor}
        />
      </li>
    );
  },
  (prevProps, nextProps) => {
    const { refProp: a, ...prev } = prevProps;
    const { refProp: b, ...next } = nextProps;
    // console.log(prev === next);
    return prev === next;
  },
);

ListItem.displayName = "ListItem";
