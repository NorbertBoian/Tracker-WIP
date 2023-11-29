import {
  lastRow,
  mention,
  saveButton,
  disabled,
} from "./MonthSettingsFooter.module.css";
import { defaultButton } from "../../../sharedStyles.module.css";
import { useAppSelector } from "../../../store";
import { englishWeekdaysArray } from "../../../constants/constants";
import { useRef, KeyboardEvent, RefObject } from "react";
import { getCreateNotification } from "../../../functions/createNotification/createNotification";
import { setMonthSettings } from "../../../functions/setMonthSettings";

interface IProps {
  setShowMonthSettings: (boolean: boolean) => void;
  submitButtonRef: RefObject<HTMLButtonElement>;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}

const pleaseFillRequiredFieldsMessage = "Please review invalid fields!";

const createNotification = getCreateNotification(
  pleaseFillRequiredFieldsMessage,
  "alert",
);

export const MonthSettingsFooter = ({
  setShowMonthSettings,
  submitButtonRef,
  onKeyDown,
}: IProps) => {
  const { monthSettingsMention, save } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const { hourlyRateValidity, overtimeMultiplierValidity, weekdays } =
    useAppSelector((state) => state.monthSettings);

  const inputsValidities = [hourlyRateValidity, overtimeMultiplierValidity];

  for (const weekday of englishWeekdaysArray) {
    const weekdayRequiredHoursValidity =
      weekdays[weekday].requiredHoursValidity;
    inputsValidities.push(weekdayRequiredHoursValidity);
  }

  const inputsValidity = inputsValidities.every((value) => value);

  return (
    <footer className={lastRow}>
      <p className={mention}>{monthSettingsMention}</p>
      <button
        type="button"
        onClick={inputsValidity ? setMonthSettings : createNotification}
        className={`${defaultButton} ${saveButton} ${
          !inputsValidity ? disabled : ""
        }`}
        ref={submitButtonRef}
        onKeyDown={onKeyDown}
      >
        {save}
      </button>
    </footer>
  );
};
