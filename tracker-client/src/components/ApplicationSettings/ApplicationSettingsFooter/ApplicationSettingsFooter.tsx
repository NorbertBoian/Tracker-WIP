import { useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from "react";
import { englishWeekdaysArray } from "../../../constants/constants";
import { getCreateNotification } from "../../../functions/createNotification/createNotification";
import { setApplicationSettings } from "../../../functions/setApplicationSettings";
import { defaultButton } from "../../../sharedStyles.module.css";

import { store, useAppSelector } from "../../../store";
import {
  footer,
  mention,
  disabled,
  saveButton,
} from "./ApplicationSettingsFooter.module.css";

interface IProps {
  footerRef: React.MutableRefObject<null | HTMLDivElement>;
  saveButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  closeButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  setReportValidity: React.Dispatch<
    React.SetStateAction<unknown[] | readonly []>
  >;
  setSelectedMobileMenu: React.Dispatch<
    React.SetStateAction<"general" | "days" | "colors">
  >;
  applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>;
  setShowApplicationSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
}

const pleaseFillRequiredFieldsMessage = "Please review invalid fields!";

const createNotification = getCreateNotification(
  pleaseFillRequiredFieldsMessage,
  "alert",
);

export const ApplicationSettingsFooter = ({
  footerRef,
  closeButtonRef,
  setReportValidity,
  saveButtonRef,
  setSelectedMobileMenu,
  applicationSettingsContainerRef,
  setShowApplicationSettings,
}: IProps) => {
  const {
    hourlyRateValidity,
    overtimeMultiplierValidity,
    displayedCurrencyValidity,
    weekdays,
  } = useAppSelector((state) => state.applicationSettings);

  const handleSaveButtonClickRef = useRef(() => {
    const {
      hourlyRateValidity,
      overtimeMultiplierValidity,
      displayedCurrencyValidity,
      weekdays,
      languageCode,
      hourlyRate,
      overtimeMultiplier,
      displayedCurrency,
      autosaveInterval,
    } = store.getState().applicationSettings;

    const generalValidities = [
      hourlyRateValidity,
      overtimeMultiplierValidity,
      displayedCurrencyValidity,
      languageCode.data,
    ];

    const daysValidities: boolean[] = [];
    const generalValidity = generalValidities.every((value) => value);
    for (const weekday of englishWeekdaysArray) {
      const weekdayRequiredHoursValidity =
        weekdays[weekday].requiredHoursValidity;
      daysValidities.push(weekdayRequiredHoursValidity);
    }
    const daysValidity = daysValidities.every((value) => value);
    const validities = {
      days: daysValidity,
      general: generalValidity,
    };

    const inputsValidity = [generalValidity, daysValidity].every(
      (value) => value,
    );

    if (inputsValidity && languageCode.data) {
      setApplicationSettings({
        weekdays,
        languageCode: languageCode.data,
        hourlyRate,
        overtimeMultiplier,
        displayedCurrency,
        autosaveInterval,
      });
      setShowApplicationSettings(false);
    } else {
      createNotification();
      if (!validities.general) {
        setSelectedMobileMenu("general");
      } else setSelectedMobileMenu("days");
      setReportValidity([]);
    }
  });

  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );
  const languageCode = useAppSelector(
    (state) => state.applicationSettings.languageCode,
  );

  const { applicationSettingsMention, save } = languageObject.data;

  const generalValidities = [
    hourlyRateValidity,
    overtimeMultiplierValidity,
    displayedCurrencyValidity,
    languageCode.data,
  ];

  const daysValidities: boolean[] = [];
  const generalValidity = generalValidities.every((value) => value);
  for (const weekday of englishWeekdaysArray) {
    const weekdayRequiredHoursValidity =
      weekdays[weekday].requiredHoursValidity;
    daysValidities.push(weekdayRequiredHoursValidity);
  }
  const daysValidity = daysValidities.every((value) => value);

  const inputsValidity = [generalValidity, daysValidity].every(
    (value) => value,
  );

  const handleKeyDownRef = useRef((event: KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      (!event.target || event.target === document.body)
    ) {
      handleSaveButtonClickRef.current();
    }
  });

  useEffect(() => {
    const handleKeyDown = handleKeyDownRef.current;
    window.document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onKeyDownRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    },
  );

  return (
    <div ref={footerRef} className={footer}>
      <p className={mention}>{applicationSettingsMention}</p>
      <button
        ref={saveButtonRef}
        type="button"
        onKeyDown={onKeyDownRef.current}
        data-save-button={true}
        onClick={handleSaveButtonClickRef.current}
        className={`${defaultButton} ${saveButton} ${
          !inputsValidity ? disabled : ""
        }`}
      >
        {save}
      </button>
    </div>
  );
};
