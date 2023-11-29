import { useFocusOutline } from "../../../hooks/useFocusOutline";
import { languageObjectType } from "../../../languages/en";
import { defaultButton, defaultInput } from "../../../sharedStyles.module.css";
import { RequiredHoursInput } from "../RequiredHoursInput/RequiredHoursInput";
import defaultClasses from "./DaySettingsBar.module.css";
import { getJoinedClasses } from "./getJoinedClasses";

interface IProps {
  dayName: string;
  disabledDay: boolean;
  requiredHoursValue: string;
  requiredHoursPlaceholder: string;
  requiredHoursChangeHandlerRef: React.MutableRefObject<
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
  toggleDisabledDay: () => void;
  requiredHoursInputOptions?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  monthInput?: boolean;
  cursor: number[];
  inputRef?: React.MutableRefObject<HTMLInputElement | null>;
  languageObject: languageObjectType;
  customClasses?: Partial<typeof defaultClasses>;
}

export const DaySettingsBar = ({
  dayName,
  disabledDay,
  requiredHoursValue,
  cursor,
  requiredHoursInputOptions = undefined,
  requiredHoursPlaceholder,
  requiredHoursChangeHandlerRef,
  toggleDisabledDay,
  languageObject,
  monthInput = false,
  inputRef = undefined,
  customClasses = {},
}: IProps) => {
  const { focused: defaultFocused, ...defaultClassesWithoutFocused } =
    defaultClasses;
  const { focused: customFocused, ...customClassesWithoutFocused } =
    customClasses;

  const focused = customFocused ?? defaultFocused;

  const combinedClasses = {
    ...defaultClassesWithoutFocused,
    ...customClassesWithoutFocused,
  };

  const {
    hourRequirementsColumnClasses,
    dayNameClasses,
    requiredHoursInputClasses,
    toggleDayButtonClasses,
    daySettingsDividerClasses,
  } = getJoinedClasses(combinedClasses);

  const {
    enable,
    disable,
    hourRequirementsExplanation,
    enableDisableDaysExplanation,
  } = languageObject;

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  return (
    <>
      <div className={`${hourRequirementsColumnClasses}`}>
        <legend className={dayNameClasses}>{dayName}</legend>
        <RequiredHoursInput
          aria-label={hourRequirementsExplanation}
          value={requiredHoursValue}
          setValue={requiredHoursChangeHandlerRef.current}
          cursor={cursor}
          refProp={inputRef}
          readOnly={disabledDay}
          placeholder={requiredHoursPlaceholder}
          onMouseDown={onInputMouseDownRef.current}
          onFocus={onInputFocusRef.current}
          onBlur={onInputBlurRef.current}
          className={`${defaultInput} ${requiredHoursInputClasses} ${
            inputisFocused ? focused : ""
          }`}
          {...(requiredHoursInputOptions ? requiredHoursInputOptions : {})}
          {...(monthInput ? { "data-month-setting-input": true } : {})}
        />
      </div>
      <hr className={daySettingsDividerClasses}></hr>
      <button
        aria-label={enableDisableDaysExplanation}
        type="button"
        onClick={toggleDisabledDay}
        className={`${defaultButton} ${toggleDayButtonClasses}`}
      >
        {disabledDay ? enable : disable}
      </button>
    </>
  );
};
