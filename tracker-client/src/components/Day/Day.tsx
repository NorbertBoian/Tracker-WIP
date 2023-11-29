import { DaySettings } from "./DaySettings/DaySettings";
import { DayStats } from "./DayStats/DayStats";
import { DayStatusIndicator } from "./DayStatusIndicator/DayStatusIndicator";
import { DayFirstRow } from "./DayFirstRow/DayFirstRow";
import { DaySecondRow } from "./DaySecondRow/DaySecondRow";
import { defaultClasses } from "./dayDefaultClasses";
import { IDayCustomClasses } from "./dayCustomClassesType";
import dayParentCustomClasses from "./Day.module.css";
import {
  useEffect,
  useRef,
  useState,
  memo,
  KeyboardEvent,
  createElement,
} from "react";
import { stringToMinutes } from "../../utils/stringToMinutes";
import { computeSalary } from "../../utils/computeSalary";
import { useAppSelector } from "../../store";
import statsButtonIcon from "./assets/statsButtonIcon.svg";
import { languageObjectType } from "../../languages/en";
import { DayTimeInputs } from "./DayTimeInputs/DayTimeInputs";
import {
  hourlyRateRegex,
  overtimeMultiplierRegex,
  requiredHoursRegex,
} from "../../../../shared/constants";
import {
  setBooleanRef,
  setStringRef,
} from "../../hooks/useMonthComponentState";
import { emptyObject } from "../../constants/constants";
import { useAnimation } from "../../hooks/useAnimation";

export type dayParentCustomClassesType = Partial<typeof dayParentCustomClasses>;

interface IProps {
  dayComponentRef?: React.MutableRefObject<null | HTMLDivElement>;
  dayNameElementRef?: React.MutableRefObject<null | HTMLDivElement>;
  weekdayString: string;
  dateString: string;
  isHoliday: boolean;
  setIsHolidayRef: setBooleanRef;
  firstInputValue: string;
  secondInputValue: string;
  firstInputPlaceholder: string;
  secondInputPlaceholder: string;
  hourlyRate: string;
  dayIndex?: number;
  dayNumber?: number;
  beganStringCursor: number[];
  endedStringCursor: number[];
  overtimeMultiplierCursor: number[];
  hourlyRateCursor: number[];
  requiredHoursCursor: number[];
  dayValidity?: boolean;
  toggleStatsButtonRef?: React.MutableRefObject<HTMLButtonElement | null>;
  focused?: "top" | "bottom" | false;
  hourlyRatePlaceholder: string;
  setHourlyRateRef: setStringRef;
  overtimeMultiplier: string;
  overtimeMultiplierPlaceholder: string;
  setOvertimeMultiplierRef: setStringRef;
  hoursRequired: string;
  hoursRequiredPlaceholder: string;
  toggleStatsButtonKeyDownHandlerRef?: React.MutableRefObject<
    (event: KeyboardEvent<HTMLButtonElement>) => void
  >;
  setHoursRequiredRef: setStringRef;
  lockedInputs?: boolean;
  firstInputSetValueRef: setStringRef;
  secondInputSetValueRef: setStringRef;
  dayNameColor: string | [number, number, number];
  languageObject: languageObjectType;
  showDay?: boolean;
  skipAnimation?: boolean;
  ignoreMenuStatsToggle?: boolean;
  onAnimationEnd?: () => void;
  firstRowWrapperRef?: React.MutableRefObject<null | HTMLDivElement>;
  customClasses?: IDayCustomClasses;
}

const verifyDayHours = (beganString: string, endedString: string) => {
  const beganMinutes = stringToMinutes(beganString);
  const endedMinutes = stringToMinutes(endedString);
  const minutesWorked =
    beganMinutes === undefined || endedMinutes === undefined
      ? 0
      : endedMinutes - beganMinutes;
  if (beganString === "" && endedString === "") {
    return "neutral";
  }
  if (minutesWorked > 0 && beganString.length > 0) return "good";
  return "bad";
};

export const DayWrapper = (
  props:
    | Omit<IProps, "onAnimationEnd" | "showDay" | "skipAnimation"> & {
        showDay: boolean;
        refProp: React.MutableRefObject<null | HTMLLIElement>;
      },
) => {
  const { showDay, refProp } = props;

  if (showDay) {
    return (
      <li ref={refProp}>
        {createElement(Day, {
          ...props,
        })}
      </li>
    );
  } else return null;
};

export const Day = memo(
  ({
    dayComponentRef,
    firstRowWrapperRef,
    dayNameElementRef,
    beganStringCursor,
    endedStringCursor,
    overtimeMultiplierCursor,
    hourlyRateCursor,
    requiredHoursCursor,
    toggleStatsButtonRef,
    weekdayString,
    ignoreMenuStatsToggle = false,
    dayNumber = 0,
    dateString,
    isHoliday,
    setIsHolidayRef,
    firstInputValue,
    secondInputValue,
    firstInputPlaceholder,
    toggleStatsButtonKeyDownHandlerRef,
    secondInputPlaceholder,
    focused = false,
    dayIndex = -1,
    languageObject,
    lockedInputs = false,
    hourlyRate,
    hourlyRatePlaceholder,
    setHourlyRateRef,
    overtimeMultiplier,
    overtimeMultiplierPlaceholder,
    setOvertimeMultiplierRef,
    hoursRequired,
    showDay,
    hoursRequiredPlaceholder,
    setHoursRequiredRef,
    firstInputSetValueRef,
    onAnimationEnd,
    skipAnimation = false,
    secondInputSetValueRef,
    dayNameColor,
    customClasses = emptyObject,
  }: IProps) => {
    if (dayIndex === 0) skipAnimation;
    // if (dayIndex === 0) console.log();

    const combinedClasses = { ...defaultClasses, ...customClasses };

    const [showDaySettings, setShowDaySettings] = useState(false);

    const [showDayStats, setShowDayStats] = useState(false);

    const showDaysStatsMenuButtonToggled = useAppSelector(
      (state) => state.main.showDaysStats,
    );

    const displayedCurrency = useAppSelector(
      (state) => state.main.displayedCurrency,
    );

    const handleToggleDayStatsRef = useRef(() => {
      setShowDayStats((showDayStats) => !showDayStats);
    });

    const handleToggleDaySettingsRef = useRef(() => {
      setShowDaySettings((showDaySettings) => !showDaySettings);
    });

    const verifiedStatus = verifyDayHours(firstInputValue, secondInputValue);

    const {
      dayClasses,
      dayTimeInputClasses,
      dayTimeInputsClasses,
      daySettingsClasses,
      dayStatsClasses,
      dayStatusIndicatorClasses,
      dayFirstRowClasses,
      daySecondRowClasses,
    } = combinedClasses;

    const {
      dayComponent,
      dayComponentDimensions,
      dayComponentMargins,
      dayAndDaySettingsWrapper,
      dayStatsAndInputsContainer,
      dayContainer,
      invalidDaySettings,
      dot,
      toggleStatsButtonContainer,
      daySettingsDotContainer,
      mounted,
      instantAnimation,
      unmounted,
    } = {
      ...defaultClasses.dayClasses,
      ...dayClasses,
    };

    const beganMinutes = stringToMinutes(firstInputValue);
    const endedMinutes = stringToMinutes(secondInputValue);
    const minutesWorked =
      beganMinutes === undefined || endedMinutes === undefined
        ? undefined
        : Math.max(endedMinutes - beganMinutes, 0);

    const salary =
      minutesWorked !== undefined
        ? computeSalary(
            +hoursRequiredPlaceholder,
            minutesWorked,
            +hourlyRatePlaceholder.replace(",", "."),
            +overtimeMultiplierPlaceholder.replace(",", "."),
          )
        : undefined;

    const payAmountString =
      salary !== undefined
        ? `${salary.toFixed(2)} ${displayedCurrency.data ?? ""}`
        : "N/A";

    const hoursWorkedString =
      minutesWorked !== undefined
        ? `${Math.floor(minutesWorked / 60)}:${("0" + (minutesWorked % 60))
            .toString()
            .slice(-2)}`
        : `N/A`;

    useEffect(() => {
      if (!ignoreMenuStatsToggle) {
        setShowDayStats(showDaysStatsMenuButtonToggled);
      }
    }, [
      ignoreMenuStatsToggle,
      setShowDayStats,
      showDaysStatsMenuButtonToggled,
    ]);

    const hourlyRateValidity =
      hourlyRateRegex.test(hourlyRate) && hourlyRate.length <= 6;
    const overtimeMultiplierValidity =
      overtimeMultiplierRegex.test(overtimeMultiplier) &&
      hourlyRate.length <= 5;
    const requiredHoursValidity =
      requiredHoursRegex.test(hoursRequired) && hoursRequired.length <= 2;

    const dayValidity =
      hourlyRateValidity && overtimeMultiplierValidity && requiredHoursValidity;

    return (
      <div
        className={`${dayComponent} ${dayComponentDimensions} ${dayComponentMargins} ${
          showDay ? mounted : unmounted
        } ${skipAnimation ? instantAnimation : ""}`}
        {...(dayComponentRef ? { ref: dayComponentRef } : {})}
        onAnimationEnd={onAnimationEnd}
      >
        <DayStatusIndicator
          verifiedStatus={verifiedStatus}
          customClasses={dayStatusIndicatorClasses}
        />
        <button
          title={"Toggle day stats"}
          // title={toggleDayStats}
          type="button"
          onClick={handleToggleDayStatsRef.current}
          className={toggleStatsButtonContainer}
          {...(toggleStatsButtonRef ? { ref: toggleStatsButtonRef } : {})}
          {...(toggleStatsButtonKeyDownHandlerRef
            ? { onKeyDown: toggleStatsButtonKeyDownHandlerRef.current }
            : {})}
        >
          <img src={statsButtonIcon} alt="" />
        </button>
        <button
          title={"Toggle day settings"}
          // title={toggleDaySettings}
          type="button"
          onClick={handleToggleDaySettingsRef.current}
          className={daySettingsDotContainer}
        >
          {!dayValidity ? <div className={invalidDaySettings}>!</div> : null}
          <div className={dot}></div>
        </button>
        <div className={dayAndDaySettingsWrapper}>
          <div className={dayContainer}>
            <DayFirstRow
              dayNameElementRef={dayNameElementRef}
              firstRowWrapperRef={firstRowWrapperRef}
              dayNameColor={dayNameColor}
              weekdayString={weekdayString}
              showDaySettings={showDaySettings}
              customClasses={dayFirstRowClasses}
              handleToggleDayStatsRef={handleToggleDayStatsRef}
            />
            <DaySecondRow
              showDaySettings={showDaySettings}
              isHoliday={isHoliday}
              dayNumber={dayNumber}
              setIsHolidayRef={setIsHolidayRef}
              inputDisabled={lockedInputs}
              dateString={dateString}
              customClasses={daySecondRowClasses}
            />
            <div className={dayStatsAndInputsContainer}>
              <DayStats
                shortVersion={showDaySettings}
                customClasses={dayStatsClasses}
                languageObject={languageObject}
                show={showDayStats}
                hoursWorkedString={hoursWorkedString}
                payAmountString={payAmountString}
              />

              <DayTimeInputs
                firstInputPlaceholder={firstInputPlaceholder}
                secondInputPlaceholder={secondInputPlaceholder}
                firstInputValue={firstInputValue}
                secondInputValue={secondInputValue}
                firstInputSetValueRef={firstInputSetValueRef}
                secondInputSetValueRef={secondInputSetValueRef}
                dayIndex={dayIndex}
                beganStringCursor={beganStringCursor}
                endedStringCursor={endedStringCursor}
                dayNumber={dayNumber}
                show={!showDayStats}
                focus={focused}
                inputDisabled={lockedInputs}
                dayTimeInputClasses={dayTimeInputClasses}
                customClasses={dayTimeInputsClasses}
              />
            </div>
          </div>
          <DaySettings
            hourlyRate={hourlyRate}
            dayNumber={dayNumber}
            show={showDaySettings}
            hourlyRatePlaceholder={hourlyRatePlaceholder}
            setHourlyRateRef={setHourlyRateRef}
            languageObject={languageObject}
            hourlyRateValidity={!!hourlyRateValidity}
            overtimeMultiplierValidity={!!overtimeMultiplierValidity}
            requiredHoursValidity={!!requiredHoursValidity}
            hourlyRateCursor={hourlyRateCursor}
            overtimeMultiplierCursor={overtimeMultiplierCursor}
            requiredHoursCursor={requiredHoursCursor}
            overtimeMultiplier={overtimeMultiplier}
            overtimeMultiplierPlaceholder={overtimeMultiplierPlaceholder}
            setOvertimeMultiplierRef={setOvertimeMultiplierRef}
            hoursRequired={hoursRequired}
            hoursRequiredPlaceholder={hoursRequiredPlaceholder}
            setHoursRequiredRef={setHoursRequiredRef}
            inputDisabled={lockedInputs}
            customClasses={daySettingsClasses}
          />
        </div>
      </div>
    );
  },
);

Day.displayName = "Day";
