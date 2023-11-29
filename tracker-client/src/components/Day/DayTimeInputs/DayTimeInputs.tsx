import { DayTimeInput } from "../DayTimeInput/DayTimeInput";
import defaultClasses from "./DayTimeInputs.module.css";
import { customClasssesType as dayTimeInputCustomClassesType } from "../DayTimeInput/DayTimeInput";
import { useAnimation } from "../../../hooks/useAnimation";
import { setStringRef } from "../../../hooks/useMonthComponentState";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  firstInputPlaceholder: string;
  secondInputPlaceholder: string;
  firstInputValue: string;
  secondInputValue: string;
  firstInputSetValueRef: setStringRef;
  secondInputSetValueRef: setStringRef;
  dayIndex: number;
  dayNumber: number;
  show: boolean;
  beganStringCursor: number[];
  endedStringCursor: number[];
  focus: false | "top" | "bottom";
  inputDisabled: boolean;
  customClasses: Partial<typeof defaultClasses>;
  dayTimeInputClasses: dayTimeInputCustomClassesType;
}

export const DayTimeInputs = ({
  firstInputPlaceholder,
  firstInputValue,
  firstInputSetValueRef,
  customClasses,
  dayTimeInputClasses,
  dayIndex,
  dayNumber,
  beganStringCursor,
  endedStringCursor,
  focus,
  show,
  inputDisabled,
  secondInputPlaceholder,
  secondInputSetValueRef,
  secondInputValue,
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const { dayTimeInputsContainer, hide, timeInputsInAnimation } =
    combinedClasses;

  const { render, onAnimationEnd, showBecameTrue, animationOngoingRef } =
    useAnimation(show);

  return render ? (
    <div
      className={`${dayTimeInputsContainer} ${!show ? hide : ""} ${
        showBecameTrue ? timeInputsInAnimation : ""
      }`}
      onAnimationEnd={onAnimationEnd}
    >
      <DayTimeInput
        placeholder={firstInputPlaceholder}
        value={firstInputValue}
        setValueRef={firstInputSetValueRef}
        dayIndex={dayIndex}
        dayNumber={dayNumber}
        show={show}
        cursor={beganStringCursor}
        input={"top"}
        focus={focus === "top"}
        animationOngoingRef={animationOngoingRef}
        darkColored={false}
        inputDisabled={inputDisabled}
        customClasses={dayTimeInputClasses}
      />
      <DayTimeInput
        placeholder={secondInputPlaceholder}
        setValueRef={secondInputSetValueRef}
        dayIndex={dayIndex}
        dayNumber={dayNumber}
        input={"bottom"}
        show={show}
        cursor={endedStringCursor}
        focus={focus === "bottom"}
        animationOngoingRef={animationOngoingRef}
        value={secondInputValue}
        darkColored={true}
        inputDisabled={inputDisabled}
        customClasses={dayTimeInputClasses}
      />
    </div>
  ) : null;
};
