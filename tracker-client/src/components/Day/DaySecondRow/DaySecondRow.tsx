import { MouseEvent, useCallback, useRef } from "react";
import { setBooleanRef } from "../../../hooks/useMonthComponentState";
import { useAppSelector } from "../../../store";
import defaultClasses from "./DaySecondRow.module.css";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  showDaySettings: boolean;
  isHoliday: boolean;
  dayNumber: number;
  setIsHolidayRef: setBooleanRef;
  dateString: string;
  inputDisabled: boolean;
  customClasses?: Partial<typeof defaultClasses>;
}

export const DaySecondRow = ({
  showDaySettings,
  isHoliday,
  dayNumber,
  setIsHolidayRef,
  dateString,
  inputDisabled,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    dateAndHolidayStatusWrapper,
    daySettingsOpenedCentering,
    daySettingsClosedCentering,
    holidayColor,
    regularDateColor,
    holidayStatus,
    disabled,
    holidayTrue,
    holidayFalse,
  } = combinedClasses;

  const secondRowClickHandler = useCallback(
    () => setIsHolidayRef.current((value) => !value, dayNumber),
    [dayNumber, setIsHolidayRef],
  );

  const { holiday } = useAppSelector((state) => state.main.languageObject.data);

  const uppercaseHoliday = holiday.toUpperCase();
  return (
    <button
      type="button"
      onClick={secondRowClickHandler}
      className={`${dateAndHolidayStatusWrapper} ${
        showDaySettings
          ? daySettingsOpenedCentering
          : daySettingsClosedCentering
      } ${inputDisabled ? disabled : ""}`}
      disabled={inputDisabled}
    >
      {/* {isHoliday ? ( */}
      <div
        className={`${holidayStatus} ${holidayColor} ${
          isHoliday ? holidayTrue : holidayFalse
        }`}
      >
        {uppercaseHoliday}
      </div>
      {/* ) : null} */}
      <h6 className={isHoliday ? holidayColor : regularDateColor}>
        {dateString}
      </h6>
    </button>
  );
};
