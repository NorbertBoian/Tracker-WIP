import {
  displayedCurrencyPlaceholder,
  englishWeekdaysArray,
  hourlyRatePlaceholder,
  overtimeMultiplierPlaceholder,
  requiredHoursPlaceholders,
} from "../../../constants/constants";
import { InputsSection } from "../../Shared/InputsSection/InputsSection";
import { ExplanationsSection } from "./ExplanationsSection/ExplanationsSection";
import { OnboardingDaySettings } from "./OnboardingDaySettings/OnboardingDaySettings";
import {
  scrollableArea,
  userButton,
  saveButton,
  disabled,
  detailedSettingsAdvice,
} from "./OnboardingSettingsScrollableArea.module.css";

import inputsSectionParentCustomClasses from "./InputsSection.module.css";
import displayedCurrencyCustomClasses from "./DisplayedCurrency.module.css";
import hourlyRateInputCustomClasses from "./HourlyRateInput.module.css";
import overtimeMultiplierCustomClasses from "./OvertimeMultiplier.module.css";

const inputsSectionCustomClasses = {
  inputsSectionClasses: inputsSectionParentCustomClasses,
  hourlyRateInputClasses: hourlyRateInputCustomClasses,
  overtimeMultiplierClasses: overtimeMultiplierCustomClasses,
  displayedCurrencyClasses: displayedCurrencyCustomClasses,
};

import settingsIcon from "../../Menu/LeftSideMenu/assets/settingsIcon.svg";
import { defaultButton } from "../../../sharedStyles.module.css";
import { store, useAppSelector } from "../../../store";
import { useRef, useEffect, KeyboardEvent as ReactKeyboardEvent } from "react";
import { userDefaultsBlankResponse } from "../../../utils/transformUserSettings";
import { getCreateNotification } from "../../../functions/createNotification/createNotification";
import { applicationSettingsWeekdaysType } from "../../../utils/typedLocalStorage/typedLocalStorage";
import { setApplicationSettings } from "../../../functions/setApplicationSettings";

interface IProps {
  setShowOnboardingSettings: React.Dispatch<React.SetStateAction<boolean>>;
  languageSelectorBarRef: React.MutableRefObject<HTMLDivElement | null>;
  languagesListRef: React.MutableRefObject<HTMLOListElement | null>;
  onboardingSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>;
  scrollableAreaRef: React.RefObject<HTMLDivElement>;
}
const englishWeekdaysMondayFirst = [
  ...englishWeekdaysArray.slice(1),
  englishWeekdaysArray[0],
];

const pleaseFillRequiredFieldsMessage = "Please review invalid fields!";

const createNotification = getCreateNotification(
  pleaseFillRequiredFieldsMessage,
  "alert",
);

export const OnboardingSettingsScrollableArea = ({
  setShowOnboardingSettings,
  languageSelectorBarRef,
  languagesListRef,
  scrollableAreaRef,
  onboardingSettingsContainerRef,
}: IProps) => {
  const hourlyRateValidity = useAppSelector(
    (state) => state.applicationSettings.hourlyRateValidity,
  );
  const overtimeMultiplierValidity = useAppSelector(
    (state) => state.applicationSettings.overtimeMultiplierValidity,
  );
  const displayedCurrencyValidity = useAppSelector(
    (state) => state.applicationSettings.displayedCurrencyValidity,
  );
  const weekdays = useAppSelector(
    (state) => state.applicationSettings.weekdays,
  );
  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );
  const cursors = useAppSelector((state) => state.applicationSettings.cursors);

  const { weekdaysArray } = languageObject.data;

  const handleSaveButtonClickRef = useRef(() => {
    const {
      weekdays,
      languageCode,
      displayedCurrency,
      overtimeMultiplier,
      hourlyRate,
      hourlyRateValidity,
      overtimeMultiplierValidity,
      displayedCurrencyValidity,
    } = store.getState().applicationSettings;

    const transformedHourlyRate = hourlyRate
      ? hourlyRate
      : hourlyRatePlaceholder;

    const transformedOvertimeMultiplier = overtimeMultiplier
      ? overtimeMultiplier
      : overtimeMultiplierPlaceholder;

    const transformedDisplayedCurrency = displayedCurrency
      ? displayedCurrency
      : displayedCurrencyPlaceholder;

    const transformedWeekdays = {} as applicationSettingsWeekdaysType;

    const inputsValidities = [
      hourlyRateValidity,
      overtimeMultiplierValidity,
      displayedCurrencyValidity,
    ];

    for (const weekday of englishWeekdaysArray) {
      const weekdayRequiredHoursValidity =
        weekdays[weekday].requiredHoursValidity;
      inputsValidities.push(weekdayRequiredHoursValidity);
      const weekdayRequiredHours = weekdays[weekday].requiredHours;
      const transformedWeekdayRequiredHours = weekdayRequiredHours
        ? weekdayRequiredHours
        : requiredHoursPlaceholders[weekday];
      Object.assign(transformedWeekdays, {
        [weekday]: {
          ...weekdays[weekday],
          requiredHours: transformedWeekdayRequiredHours,
        },
      });
    }

    const inputsValidity = inputsValidities.every((value) => value);

    if (inputsValidity && languageCode.data) {
      const transformedApplicationSettings = {
        hourlyRate: transformedHourlyRate,
        overtimeMultiplier: transformedOvertimeMultiplier,
        displayedCurrency: transformedDisplayedCurrency,
        autosaveInterval: userDefaultsBlankResponse.autosaveInterval,
        weekdays: transformedWeekdays,
        languageCode: languageCode.data,
      };
      setApplicationSettings(transformedApplicationSettings);
      setShowOnboardingSettings(false);
    } else {
      createNotification();
      onboardingSettingsContainerRef.current?.reportValidity();
    }
  });

  const inputsValidities = [
    hourlyRateValidity,
    overtimeMultiplierValidity,
    displayedCurrencyValidity,
  ];

  for (const weekday of englishWeekdaysArray) {
    const weekdayRequiredHoursValidity =
      weekdays[weekday].requiredHoursValidity;
    inputsValidities.push(weekdayRequiredHoursValidity);
  }

  const inputsValidity = inputsValidities.every((value) => value);

  const weekdaysMondayFirst = [...weekdaysArray.slice(1), weekdaysArray[0]];

  const handleKeyDownRef = useRef((event: KeyboardEvent) => {
    if (event.key === "Enter") handleSaveButtonClickRef.current();
  });

  useEffect(() => {
    const handleKeyDown = handleKeyDownRef.current;
    window.document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const {
    hourlyRate: hourlyRateCursor,
    overtimeMultiplier: overtimeMultiplierCursor,
    weekdays: weekdaysCursors,
  } = cursors;

  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const handleSaveButtonTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        languageSelectorBarRef.current?.focus();
      }
    },
  );

  return (
    <div className={scrollableArea} ref={scrollableAreaRef}>
      <InputsSection
        settingsContainerRef={onboardingSettingsContainerRef}
        languageSelectorBarRef={languageSelectorBarRef}
        languagesListRef={languagesListRef}
        customClasses={inputsSectionCustomClasses}
        type="onboarding"
        hourlyRateCursor={hourlyRateCursor}
        overtimeMultiplierCursor={overtimeMultiplierCursor}
        hourlyRatePlaceholder={hourlyRatePlaceholder}
        overtimeMultiplierPlaceholder={overtimeMultiplierPlaceholder}
        displayedCurrencyPlaceholder={displayedCurrencyPlaceholder}
      />
      <ExplanationsSection />
      {weekdaysMondayFirst.map((weekDay, i) => (
        <OnboardingDaySettings
          key={i}
          dayName={weekDay}
          cursor={weekdaysCursors[englishWeekdaysMondayFirst[i]]}
          englishDayName={englishWeekdaysMondayFirst[i]}
          requiredHoursPlaceholder={
            requiredHoursPlaceholders[englishWeekdaysMondayFirst[i]]
          }
        />
      ))}
      <footer className={detailedSettingsAdvice}>
        For more detailed settings use the application settings
        <div className={userButton}>
          <img src={settingsIcon} alt="" />
          Guest
        </div>
        (top-left) after pressing Continue.
        <button
          type="button"
          className={`${defaultButton} ${saveButton} ${
            !inputsValidity ? disabled : ""
          }`}
          ref={saveButtonRef}
          onKeyDown={handleSaveButtonTabRef.current}
          onClick={handleSaveButtonClickRef.current}
        >
          Continue
        </button>
      </footer>
    </div>
  );
};
