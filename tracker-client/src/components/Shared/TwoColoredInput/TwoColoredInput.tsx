import { ChangeEvent, useRef } from "react";
import { useFocusOutline } from "../../../hooks/useFocusOutline";
import { defaultInput } from "../../../sharedStyles.module.css";
import { DecimalInput } from "../DecimalInput/DecimalInput";
import defaultClasses from "./TwoColoredInput.module.css";

interface IProps {
  descriptionString: string;
  value: string;
  placeholder?: string;
  setValueRef: React.MutableRefObject<
    (
      value:
        | {
            value: string;
            cursor?: number[] | undefined;
          }
        | ((value: string) => {
            value: string;
            cursor?: number[] | undefined;
          }),
    ) => void
  >;
  expectedPattern?: RegExp;
  cursor?: number[];
  valid?: boolean;
  type: "decimal" | "currency";
  required?: boolean;
  maxLength: number;
  monthInput?: boolean;
  customClasses?: Partial<typeof defaultClasses>;
  refProp?: React.MutableRefObject<HTMLInputElement | null>;
}

export const TwoColoredInput = ({
  descriptionString,
  value,
  cursor = [],
  valid = true,
  placeholder = "",
  setValueRef,
  expectedPattern = undefined,
  maxLength,
  monthInput = false,
  type,
  required = false,
  customClasses = {},
  refProp = undefined,
}: IProps) => {
  const ref = useRef(null);
  refProp = refProp ?? ref;
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    container,
    description,
    input,
    descriptionBackgroundColor,
    containerBackgroundColor,
    textColor,
    dimensions,
    focused: focusedClass,
    containerOther,
    invalid: invalidClass,
  } = combinedClasses;

  const handleOnChangeRef = useRef((event: ChangeEvent<HTMLInputElement>) => {
    const processedString = event.currentTarget.value
      .replace(/\d/, "")
      .slice(0, 5);
    setValueRef.current({ value: processedString });
  });

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  return (
    <fieldset
      className={`${container} ${textColor} ${dimensions} ${containerBackgroundColor} ${containerOther} ${
        !valid ? invalidClass : ""
      } ${inputisFocused ? focusedClass : ""}`}
    >
      <div className={`${description} ${descriptionBackgroundColor}`}>
        <label>{descriptionString}</label>
      </div>
      {type === "currency" ? (
        <input
          onMouseDown={onInputMouseDownRef.current}
          onFocus={onInputFocusRef.current}
          onBlur={onInputBlurRef.current}
          className={`${defaultInput} ${input} ${textColor}`}
          value={value}
          aria-label={`${valid ? "" : "Invalid "}${descriptionString}`}
          maxLength={maxLength}
          autoComplete="transaction-currency"
          required={required}
          placeholder={placeholder}
          onChange={handleOnChangeRef.current}
          ref={refProp}
          {...(expectedPattern
            ? { pattern: expectedPattern.toString().slice(1, -1) }
            : {})}
          {...(monthInput ? { "data-month-setting-input": true } : {})}
        />
      ) : (
        <DecimalInput
          handleMouseDownRef={onInputMouseDownRef}
          handleFocusRef={onInputFocusRef}
          handleBlurRef={onInputBlurRef}
          value={value}
          aria-label={`${valid ? "" : "Invalid "}${descriptionString}`}
          maxLength={maxLength}
          cursor={cursor}
          setValue={setValueRef.current}
          refProp={refProp}
          required={required}
          placeholder={placeholder}
          {...(expectedPattern
            ? { pattern: expectedPattern.toString().slice(1, -1) }
            : {})}
          {...(monthInput ? { "data-month-setting-input": true } : {})}
          className={`${defaultInput} ${input} ${textColor}`}
        />
      )}
    </fieldset>
  );
};
