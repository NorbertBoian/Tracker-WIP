import defaultClasses from "./DaySettings.module.css";
import dollarIcon from "./assets/dollarIcon.svg";
import hourglassIcon from "./assets/hourglassIcon.svg";
import percentIcon from "./assets/percentIcon.svg";
import { defaultInput } from "../../../sharedStyles.module.css";
import { languageObjectType } from "../../../languages/en";
import { useAnimation } from "../../../hooks/useAnimation";
import { DecimalInput } from "../../Shared/DecimalInput/DecimalInput";
import {
  hourlyRateNoEmptyStringRegex,
  overtimeMultiplierNoEmptyStringRegex,
  requiredHoursNoEmptyStringRegex,
} from "../../../../../shared/constants";
import { RequiredHoursInput } from "../../Shared/RequiredHoursInput/RequiredHoursInput";
import { useCallback } from "react";
import { setStringRef } from "../../../hooks/useMonthComponentState";
import { useFocusOutline } from "../../../hooks/useFocusOutline";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  hourlyRate: string;
  show: boolean;
  hourlyRatePlaceholder: string;
  dayNumber: number;
  setHourlyRateRef: setStringRef;
  overtimeMultiplier: string;
  overtimeMultiplierPlaceholder: string;
  setOvertimeMultiplierRef: setStringRef;
  hoursRequired: string;
  hoursRequiredPlaceholder: string;
  setHoursRequiredRef: setStringRef;
  inputDisabled: boolean;
  hourlyRateCursor: number[];
  overtimeMultiplierCursor: number[];
  requiredHoursCursor: number[];
  languageObject: languageObjectType;
  hourlyRateValidity: boolean;
  overtimeMultiplierValidity: boolean;
  requiredHoursValidity: boolean;
  requiredHoursInputRef?: React.RefObject<HTMLInputElement>;
  overtimeMultiplierInputRef?: React.RefObject<HTMLInputElement>;
  hourlyRateInputRef?: React.RefObject<HTMLInputElement>;
  customClasses?: Partial<typeof defaultClasses>;
}

export const DaySettings = ({
  hourlyRate,
  hourlyRateCursor,
  overtimeMultiplierCursor,
  requiredHoursCursor,
  hourlyRateValidity,
  overtimeMultiplierValidity,
  requiredHoursValidity,
  hourlyRatePlaceholder,
  setHourlyRateRef,
  overtimeMultiplier,
  requiredHoursInputRef,
  overtimeMultiplierInputRef,
  hourlyRateInputRef,
  overtimeMultiplierPlaceholder,
  setOvertimeMultiplierRef,
  hoursRequired,
  show,
  dayNumber,
  hoursRequiredPlaceholder,
  setHoursRequiredRef,
  inputDisabled,
  languageObject,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    daySettingsComponent,
    daySettingRow,
    dollarIcon: dollarIconClass,
    hourglassIcon: hourglassIconClass,
    percentIcon: percentIconClass,
    iconWrapper,
    daySettingsDotContainer,
    invalid,
    doNotDisplay,
    daySettingsString,
    focused,
    hide,
  } = combinedClasses;

  const handleHourlyRateChange = useCallback(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => setHourlyRateRef.current(value, dayNumber),
    [dayNumber, setHourlyRateRef],
  );

  const handleOvertimeMultiplierChange = useCallback(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => setOvertimeMultiplierRef.current(value, dayNumber),
    [dayNumber, setOvertimeMultiplierRef],
  );

  const handleHoursRequiredChange = useCallback(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => setHoursRequiredRef.current(value, dayNumber),
    [dayNumber, setHoursRequiredRef],
  );

  const { render, onAnimationEnd } = useAnimation(show);

  const {
    daySettings,
    hourlyRate: localizedHourlyRateString,
    overtimeMultiplier: localizedOvertimeMultiplierString,
    requiredHours: localizedRequiredHoursString,
  } = languageObject;

  const {
    onInputMouseDownRef: onHourlyRateInputMouseDownRef,
    onInputFocusRef: onHourlyRateInputFocusRef,
    onInputBlurRef: onHourlyRateInputBlurRef,
    inputisFocused: hourlyRateInputIsFocused,
  } = useFocusOutline();

  const {
    onInputMouseDownRef: onOvertimeMultiplierInputMouseDownRef,
    onInputFocusRef: onOvertimeMultiplierInputFocusRef,
    onInputBlurRef: onOvertimeMultiplierInputBlurRef,
    inputisFocused: overtimeMultiplierInputIsFocused,
  } = useFocusOutline();

  const {
    onInputMouseDownRef: onRequiredHoursInputMouseDownRef,
    onInputFocusRef: onRequiredHoursInputFocusRef,
    onInputBlurRef: onRequiredHoursInputBlurRef,
    inputisFocused: requiredHoursInputIsFocused,
  } = useFocusOutline();

  return render ? (
    <div
      className={`${daySettingsComponent} ${!render ? doNotDisplay : ""} ${
        !show ? hide : ""
      }`}
      onAnimationEnd={onAnimationEnd}
    >
      <pre className={daySettingsString}>{daySettings}</pre>
      <div className={daySettingRow} title={localizedHourlyRateString}>
        <div className={iconWrapper}>
          <img className={dollarIconClass} src={dollarIcon} alt="" />
        </div>
        <DecimalInput
          handleBlurRef={onHourlyRateInputBlurRef}
          handleFocusRef={onHourlyRateInputFocusRef}
          handleMouseDownRef={onHourlyRateInputMouseDownRef}
          data-day-setting-input={true}
          className={`${defaultInput} ${!hourlyRateValidity ? invalid : ""} ${
            hourlyRateInputIsFocused ? focused : ""
          }`}
          aria-label={localizedHourlyRateString}
          refProp={hourlyRateInputRef}
          value={hourlyRate}
          cursor={hourlyRateCursor}
          maxLength={6}
          setValue={handleHourlyRateChange}
          readOnly={inputDisabled}
          placeholder={hourlyRatePlaceholder}
          pattern={hourlyRateNoEmptyStringRegex.toString().slice(1, -1)}
        />
      </div>
      <div className={daySettingRow} title={localizedOvertimeMultiplierString}>
        <div className={iconWrapper}>
          <img className={percentIconClass} src={percentIcon} alt="" />
        </div>
        <DecimalInput
          aria-label={localizedOvertimeMultiplierString}
          handleBlurRef={onOvertimeMultiplierInputBlurRef}
          handleMouseDownRef={onOvertimeMultiplierInputMouseDownRef}
          handleFocusRef={onOvertimeMultiplierInputFocusRef}
          data-day-setting-input={true}
          className={`${defaultInput} ${
            !overtimeMultiplierValidity ? invalid : ""
          } ${overtimeMultiplierInputIsFocused ? focused : ""} `}
          cursor={overtimeMultiplierCursor}
          value={overtimeMultiplier}
          refProp={overtimeMultiplierInputRef}
          maxLength={5}
          setValue={handleOvertimeMultiplierChange}
          readOnly={inputDisabled}
          placeholder={overtimeMultiplierPlaceholder}
          pattern={overtimeMultiplierNoEmptyStringRegex.toString().slice(1, -1)}
        />
      </div>
      <div className={daySettingRow} title={localizedRequiredHoursString}>
        <div className={iconWrapper}>
          <img className={hourglassIconClass} src={hourglassIcon} alt="" />
        </div>
        <RequiredHoursInput
          aria-label={localizedRequiredHoursString}
          onBlur={onRequiredHoursInputBlurRef.current}
          onFocus={onRequiredHoursInputFocusRef.current}
          onMouseDown={onRequiredHoursInputMouseDownRef.current}
          data-day-setting-input={true}
          value={hoursRequired}
          refProp={requiredHoursInputRef}
          cursor={requiredHoursCursor}
          setValue={handleHoursRequiredChange}
          readOnly={inputDisabled}
          placeholder={hoursRequiredPlaceholder}
          className={`${defaultInput} ${
            !requiredHoursValidity ? invalid : ""
          } ${requiredHoursInputIsFocused ? focused : ""}`}
          pattern={requiredHoursNoEmptyStringRegex.toString().slice(1, -1)}
        />
      </div>
    </div>
  ) : null;
};
