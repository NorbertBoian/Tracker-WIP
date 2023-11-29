import { useState, SetStateAction, useRef, KeyboardEvent } from "react";
import { setBooleanRef } from "../../../../hooks/useMonthComponentState";
import { useAppSelector } from "../../../../store";
import { Day } from "../../../Day/Day";
import defaultClasses from "./DayPreviewComponent.module.css";

interface IProps {
  dayString: string;
  exampleDayNameElementRef?: React.MutableRefObject<HTMLHeadingElement | null>;
  dayNameColor: [number, number, number];
  firstRowWrapperRef?: React.MutableRefObject<null>;
  customClasses?: Partial<typeof defaultClasses>;
  toggleStatsButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  toggleStatsButtonKeyDownHandlerRef?: React.MutableRefObject<
    (event: KeyboardEvent<HTMLButtonElement>) => void
  >;
  dayPreviewRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const emptyObject = {};

export const DayPreviewComponent = ({
  dayString,
  dayNameColor,
  exampleDayNameElementRef = undefined,
  firstRowWrapperRef = undefined,
  toggleStatsButtonRef,
  dayPreviewRef,
  toggleStatsButtonKeyDownHandlerRef,
  customClasses = emptyObject,
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    exampleDayComponentMargins,
    exampleDayComponentDimensions,
    previewContainer,
    previewDescription,
    dayExampleWrapper,
    previewContainerOther,
  } = combinedClasses;

  const dayCustomClasses = {
    dayClasses: {
      dayComponentMargins: exampleDayComponentMargins,
      dayComponentDimensions: exampleDayComponentDimensions,
    },
  };

  const [beganString, setBeganStringValue] = useState<{
    value: string;
    cursor: number[];
  }>({
    value: "",
    cursor: [],
  });
  const [endedString, setEndedStringValue] = useState<{
    value: string;
    cursor: number[];
  }>({
    value: "",
    cursor: [],
  });
  const [hourlyRate, setHourlyRate] = useState<{
    value: string;
    cursor: number[];
  }>({ value: "12.34", cursor: [] });
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<{
    value: string;
    cursor: number[];
  }>({
    value: "2.65",
    cursor: [],
  });
  const [hoursRequired, setHoursRequired] = useState<{
    value: string;
    cursor: number[];
  }>({
    value: "7",
    cursor: [],
  });
  const [isHoliday, setIsHoliday] = useState(false);

  const setBeganStringValueRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) =>
      setBeganStringValue((prevValue) => {
        if (value instanceof Function) {
          const computedValue = value(prevValue.value);
          return {
            value: computedValue.value,
            cursor:
              computedValue.cursor !== undefined ? computedValue.cursor : [0],
          };
        } else {
          return { ...prevValue, ...value };
        }
      }),
  );

  const setEndedStringValueRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) =>
      setEndedStringValue((prevValue) => {
        if (value instanceof Function) {
          const computedValue = value(prevValue.value);
          return {
            value: computedValue.value,
            cursor:
              computedValue.cursor !== undefined ? computedValue.cursor : [0],
          };
        } else {
          return { ...prevValue, ...value };
        }
      }),
  );

  const setHourlyRateRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        setHourlyRate((prevValue) => {
          const computedValue = value(prevValue.value);
          return {
            value: computedValue.value,
            cursor:
              computedValue.cursor !== undefined ? computedValue.cursor : [0],
          };
        });
      }
    },
  );
  const setOvertimeMultiplierRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        setOvertimeMultiplier((prevValue) => {
          const computedValue = value(prevValue.value);
          return {
            value: computedValue.value,
            cursor:
              computedValue.cursor !== undefined ? computedValue.cursor : [0],
          };
        });
      }
    },
  );
  const setHoursRequiredRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        setHoursRequired((prevValue) => {
          const computedValue = value(prevValue.value);
          return {
            value: computedValue.value,
            cursor:
              computedValue.cursor !== undefined ? computedValue.cursor : [0],
          };
        });
      }
    },
  );
  const setIsHolidayRef = useRef((value: SetStateAction<boolean>) =>
    setIsHoliday(value),
  );

  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );
  const { previewofDayNameColor, example } = languageObject.data;

  return (
    <div
      {...(dayPreviewRef ? { ref: dayPreviewRef } : {})}
      className={`${previewContainer} ${previewContainerOther}`}
      role="presentation"
    >
      <div className={previewDescription}>{previewofDayNameColor}</div>
      <div className={dayExampleWrapper}>
        {
          <Day
            dayNameElementRef={exampleDayNameElementRef}
            languageObject={languageObject.data}
            inputType="tel"
            weekdayString={dayString}
            dateString={example}
            isHoliday={isHoliday}
            setIsHolidayRef={setIsHolidayRef as unknown as setBooleanRef}
            firstInputValue={beganString.value}
            secondInputValue={endedString.value}
            firstInputPlaceholder="00:00"
            secondInputPlaceholder="00:00"
            dayNameColor={dayNameColor}
            firstInputSetValueRef={setBeganStringValueRef}
            secondInputSetValueRef={setEndedStringValueRef}
            hourlyRate={hourlyRate.value}
            hourlyRatePlaceholder={"10"}
            setHourlyRateRef={setHourlyRateRef}
            overtimeMultiplier={overtimeMultiplier.value}
            overtimeMultiplierPlaceholder={"1.75"}
            setOvertimeMultiplierRef={setOvertimeMultiplierRef}
            hoursRequired={hoursRequired.value}
            ignoreMenuStatsToggle={true}
            beganStringCursor={beganString.cursor}
            endedStringCursor={endedString.cursor}
            overtimeMultiplierCursor={overtimeMultiplier.cursor}
            hourlyRateCursor={hourlyRate.cursor}
            requiredHoursCursor={hoursRequired.cursor}
            hoursRequiredPlaceholder={"8"}
            setHoursRequiredRef={setHoursRequiredRef}
            firstRowWrapperRef={firstRowWrapperRef}
            {...(toggleStatsButtonRef ? { toggleStatsButtonRef } : {})}
            {...(toggleStatsButtonKeyDownHandlerRef
              ? { toggleStatsButtonKeyDownHandlerRef }
              : {})}
            customClasses={dayCustomClasses}
          />
        }
      </div>
    </div>
  );
};
