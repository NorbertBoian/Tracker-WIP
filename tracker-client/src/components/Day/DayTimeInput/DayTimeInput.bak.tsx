import defaultClasses from "./DayTimeInput.module.css";
import stopwatchIcon from "./assets/stopwatchIcon.svg";
import { defaultButton, defaultInput } from "../../../sharedStyles.module.css";
import { useEffect, useRef, useState } from "react";
import { useAnimation } from "../../../hooks/useAnimation";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  inputType: string;
  darkColored: boolean;
  value: string;
  focus: boolean;
  dayIndex: number;
  show: boolean;
  input: "top" | "bottom";
  setValue: (string: string) => void;
  placeholder: string;
  inputDisabled: boolean;
  customClasses?: Partial<typeof defaultClasses>;
}

const useFocus = (active: boolean) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (active && ref.current instanceof HTMLInputElement) {
      ref.current.focus();
      ref.current.select();
    }
  }, [active]);

  return ref;
};

export const DayTimeInput = ({
  inputType,
  darkColored,
  value,
  focus,
  dayIndex,
  input,
  setValue,
  placeholder,
  inputDisabled,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    stopwatchIconContainer,
    dayTimeInputComponent,
    lightColor,
    stopwatchAnimateIn,
    hideStopwatch,
    hideBackground,
    background,
    stopwatchIconWrapper,
    darkColor,
  } = combinedClasses;

  const [triggerSelectionUpdate, setTriggerSelectionUpdate] = useState<
    boolean | undefined
  >();
  const selection = useRef(0);

  const inputElement = useFocus(focus);

  let [remainingString, processedString] = ["", ""];

  const addCharacter = (test: RegExp) => {
    const charIndex = remainingString.search(test);
    const foundChar = remainingString[charIndex];
    if (foundChar) {
      processedString += foundChar;
      remainingString = remainingString.slice(charIndex + 1);
    }
    return foundChar;
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const initialValue = event.target.value;
    const actualValue = value;
    const notDeleting = initialValue.length > actualValue.length;
    const lastChar = initialValue.at(-1);
    remainingString = event.target.value;
    processedString = "";

    const pos = event.target.selectionEnd;
    selection.current = pos !== null ? pos : 0;
    const firstCharacter = addCharacter(/[\d:]/);
    if (+firstCharacter > 2) {
      if (
        // !processedString.includes(":") &&
        processedString.length === 1 &&
        (lastChar !== ":" || notDeleting)
      )
        processedString += ":";
    }
    if (+firstCharacter < 2) {
      addCharacter(/[\d:]|:/);
    }
    if (+firstCharacter === 2) {
      addCharacter(/[0-4]|:/);
    }
    if (
      !processedString.includes(":") &&
      processedString.length === 2 &&
      (lastChar !== ":" || notDeleting)
    ) {
      processedString += ":";
    }

    if (processedString === "24:" && notDeleting) {
      processedString += "00";
      selection.current = 5;
    } else {
      const fourthChar = addCharacter(/\d/);
      if (+fourthChar > 5) {
        processedString =
          processedString.slice(0, -1) + "0" + processedString.slice(-1);
        selection.current = 5;
      } else {
        addCharacter(/\d/);
        if (!initialValue.includes(":")) selection.current++;
      }
    }

    if (
      processedString[selection.current] === ":" &&
      processedString.length > value.length
    )
      selection.current++;
    if (processedString === value) {
      selection.current--;
      setTriggerSelectionUpdate((prevState) => !prevState);
    } else {
      setValue(processedString);
    }
  };

  useEffect(() => {
    if (inputElement.current !== null) {
      inputElement.current.setSelectionRange(
        selection.current,
        selection.current,
      );
    }
  }, [value, triggerSelectionUpdate, selection, inputElement]);

  const handleBlur = () => {
    if (value[1] === ":") {
      const actualValue = value;
      setValue("0" + actualValue);
    }
  };

  const onTimeStampButton = () => {
    const currentTime = new Date().toLocaleTimeString(undefined, {
      hour12: false,
      timeStyle: "short",
    });
    setValue(currentTime);
  };

  const {
    render: renderStopwatch,
    onAnimationEnd: onStopwatchAnimationEnd,
    showBecameTrue: showStopwatchBecameTrue,
    ref: stopWatchRef,
  } = useAnimation<HTMLButtonElement>(!inputDisabled);

  return (
    <div className={dayTimeInputComponent}>
      {renderStopwatch ? (
        <button
          disabled={inputDisabled}
          ref={stopWatchRef}
          onClick={onTimeStampButton}
          className={`${defaultButton} ${stopwatchIconContainer} ${
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
            <img src={stopwatchIcon} />
          </div>
        </button>
      ) : null}{" "}
      <input
        value={value}
        ref={inputElement}
        data-day-index={dayIndex}
        data-input={input}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`${defaultInput} ${darkColored ? darkColor : lightColor}`}
        type={inputType}
        readOnly={inputDisabled}
        onChange={onInputChange}
      />
    </div>
  );
};
