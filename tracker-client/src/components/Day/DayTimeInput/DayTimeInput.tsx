import defaultClasses from "./DayTimeInput.module.css";
import stopwatchIcon from "./assets/stopwatchIcon.svg";
import { defaultButton, defaultInput } from "../../../sharedStyles.module.css";
import { useEffect, useRef, useState, FocusEvent, useCallback } from "react";
import { useAnimation } from "../../../hooks/useAnimation";
import { timeRegex } from "../../../../../shared/constants";
import { setStringRef } from "../../../hooks/useMonthComponentState";
import { useFocusOutline } from "../../../hooks/useFocusOutline";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  darkColored: boolean;
  value: string;
  focus: boolean;
  cursor: number[];
  dayIndex: number;
  dayNumber: number;
  show: boolean;
  input: "top" | "bottom";
  animationOngoingRef: React.MutableRefObject<boolean | undefined>;
  setValueRef: setStringRef;
  placeholder: string;
  inputDisabled: boolean;
  customClasses?: Partial<typeof defaultClasses>;
}

const useFocus = (
  active: boolean,
  animationOngoingRef: React.MutableRefObject<boolean | undefined>,
) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (active && ref.current instanceof HTMLInputElement) {
      if (animationOngoingRef.current) {
        ref.current.blur();
      } else {
        ref.current.focus();
        ref.current.select();
      }
    }
  }, [active, animationOngoingRef]);

  return ref;
};

const deletingInputTypes = [
  "deleteWordBackward",
  "deleteWordForward",
  "deleteSoftLineBackward",
  "deleteSoftLineForward",
  "deleteEntireSoftLine",
  "deleteHardLineBackward",
  "deleteHardLineForward",
  "deleteByDrag",
  "deleteByCut",
  "deleteContent",
  "deleteContentBackward",
  "deleteContentForward",
];

export const DayTimeInput = ({
  darkColored,
  value,
  focus,
  cursor,
  dayIndex,
  dayNumber,
  input,
  setValueRef,
  placeholder,
  animationOngoingRef,
  inputDisabled,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    stopwatchIconContainer,
    dayTimeInputComponent,
    invisibleStopwatchButton,
    dayTimeInputContainer,
    lightColor,
    stopwatchAnimateIn,
    hideStopwatch,
    hideBackground,
    focusOutline,
    background,
    stopwatchIconWrapper,
    darkColor,
  } = combinedClasses;

  const inputElementRef = useFocus(focus, animationOngoingRef);
  // const [cursorPosition, setCursorPosition] = useState([0]);

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValueRef.current((value) => {
        const { inputType } = event.nativeEvent as InputEvent;
        const initialString = event.target.value;
        let string = initialString;
        let processedString = "";
        const initialPos = event.target.selectionEnd ?? 0;
        let pos = initialPos;
        const initialStringValidity = timeRegex.test(
          initialString.slice(0, initialPos),
        );
        const addCharacter = (RegExp: RegExp) => {
          const characterIndex = string.search(RegExp);
          processedString += string[characterIndex] ?? "";
          string = string.slice(characterIndex + 1);
        };
        const notDeleting = !deletingInputTypes.includes(inputType);
        if (!notDeleting && initialString.length === 1 && value[1] === ":") {
          return { value: "", cursor: [pos ?? 0] };
        } else {
          addCharacter(/[\d:]/);
          if (processedString === "2") {
            addCharacter(/[0-4:]/);
          } else if (processedString === "0" || processedString === "1") {
            addCharacter(/[\d:]/);
          }
          if (
            processedString.at(-1) !== ":" &&
            (processedString.length === 2 || +processedString > 2) &&
            (notDeleting || initialString.length > 2)
          ) {
            processedString += ":";
            if (
              (notDeleting &&
                initialString.length > 1 &&
                initialPos > 1 &&
                initialPos < 4) ||
              initialString.length === 1
            )
              pos++;
          }
          if (processedString === "24:" && notDeleting) {
            processedString += "00";
            pos = 5;
          } else if (processedString.at(-1) === ":") {
            addCharacter(/\d/);
            if (+(processedString.at(-1) ?? 0) > 5) {
              processedString =
                processedString.slice(0, -1) + "0" + processedString.slice(-1);
              pos++;
            } else {
              addCharacter(/\d/);
            }
          }
          if (value === processedString) {
            if (!initialStringValidity) pos = initialPos - 1;
            else if (initialString[initialPos] === ":") pos = initialPos;
          }
          if (value !== processedString)
            return { value: processedString, cursor: [pos ?? 0] };
          else return { value, cursor: [pos ?? 0] };
        }
      }, dayNumber);
    },
    [dayNumber, setValueRef],
  );

  useEffect(() => {
    inputElementRef?.current?.setSelectionRange(cursor[0], cursor[0]);
  }, [cursor, inputElementRef]);

  const onTimeStampButtonRef = useRef(() => {
    const currentTime = new Date().toLocaleTimeString("en-GB", {
      hour12: false,
      timeStyle: "short",
    });
    setValueRef.current({ value: currentTime }, dayNumber);
  });

  const {
    render: renderStopwatch,
    onAnimationEnd: onStopwatchAnimationEnd,
    showBecameTrue: showStopwatchBecameTrue,
    ref: stopWatchRef,
  } = useAnimation<HTMLButtonElement>(!inputDisabled);

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  const {
    onInputMouseDownRef: onStopwatchMouseDownRef,
    onInputFocusRef: onStopwatchFocusRef,
    onInputBlurRef: onStopwatchBlurRef,
    inputisFocused: stopwatchisFocused,
  } = useFocusOutline();

  const handleBlurRef = useRef((event: FocusEvent<HTMLInputElement>) => {
    onInputBlurRef.current();
    if (event.target.value[1] === ":") {
      setValueRef.current({ value: "0" + event.target.value }, dayNumber);
    }
  });

  return (
    <div className={dayTimeInputComponent}>
      <div
        className={`${invisibleStopwatchButton} ${
          stopwatchisFocused ? focusOutline : ""
        }`}
      ></div>
      <div
        className={`${dayTimeInputContainer} ${
          inputisFocused ? focusOutline : ""
        }`}
      >
        {renderStopwatch ? (
          <button
            title="Set input to current time"
            // title="setInputToCurrentTime"
            onFocus={onStopwatchFocusRef.current}
            onBlur={onStopwatchBlurRef.current}
            onMouseDown={onStopwatchMouseDownRef.current}
            type="button"
            disabled={inputDisabled}
            ref={stopWatchRef}
            onClick={onTimeStampButtonRef.current}
            className={`${stopwatchIconContainer} ${
              showStopwatchBecameTrue ? stopwatchAnimateIn : ""
            }`}
          >
            <div
              onAnimationEnd={onStopwatchAnimationEnd}
              className={`${background} ${inputDisabled ? hideBackground : ""}`}
            ></div>
            <div
              className={`${stopwatchIconWrapper} ${
                inputDisabled ? hideStopwatch : ""
              }`}
            >
              <img src={stopwatchIcon} alt="" />
            </div>
          </button>
        ) : null}
        <input
          onFocus={onInputFocusRef.current}
          onMouseDown={onInputMouseDownRef.current}
          value={value}
          title={
            input === "top" ? "Hour started working" : "Hour finished working"
          }
          aria-label={
            input === "top" ? "Hour started working" : "Hour finished working"
          }
          // title={input==="top"?hourStartedWorking:hourFinishedWorking"}
          ref={inputElementRef}
          data-day-index={dayIndex}
          data-input={input}
          onBlur={handleBlurRef.current}
          placeholder={placeholder}
          className={`${defaultInput} ${darkColored ? darkColor : lightColor}`}
          type="tel"
          readOnly={inputDisabled}
          onChange={onInputChange}
        />
      </div>
    </div>
  );
};
