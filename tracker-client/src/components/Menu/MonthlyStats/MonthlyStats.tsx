import { useMonthData } from "../../../hooks/useMonthData";
import { useAppSelector } from "../../../store";
import { getEnabledDays } from "../../Month/functions/getEnabledDays";
import { getEarnedAndHoursStrings } from "./functions/getEarnedAndHoursStrings";
import {
  statsContainer,
  statDescription,
  statShowcase,
  overflowingContainer,
  loggedIn as loggedInClass,
} from "./MonthlyStats.module.css";

interface IProps {
  loggedIn: boolean;
}

export const MonthlyStats = ({ loggedIn }: IProps) => {
  const { earnedThisMonth, workedThisMonth, hours, minutes } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const displayedCurrency = useAppSelector(
    (state) => state.main.displayedCurrency,
  );
  const dates = useAppSelector((state) => state.main.dates);

  const { combinedMonthSettings } = useMonthData();

  const enabledDays =
    combinedMonthSettings.data?.monthlyDisabledDays && dates.data
      ? getEnabledDays(
          dates.data,
          combinedMonthSettings.data.monthlyDisabledDays,
        )
      : undefined;

  const combinedMonthSettingsData = combinedMonthSettings.data;
  const displayedCurrencyData = displayedCurrency.data;

  if (
    combinedMonthSettings.isSuccess &&
    combinedMonthSettingsData &&
    enabledDays &&
    dates.data &&
    dates.isSuccess &&
    displayedCurrency.isSuccess &&
    displayedCurrencyData
  ) {
    const {
      monthlyHourlyRate,
      monthlyOvertimeMultiplier,
      monthlyRequiredHours,
    } = combinedMonthSettingsData;

    const { hoursWorkedString, earnedString } = getEarnedAndHoursStrings(
      enabledDays,
      monthlyHourlyRate,
      monthlyOvertimeMultiplier,
      monthlyRequiredHours,
      hours,
      minutes,
      displayedCurrencyData,
    );

    return (
      <div className={`${statsContainer} ${loggedIn ? loggedInClass : ""}`}>
        <div className={overflowingContainer}>
          <div className={statDescription}>{`${earnedThisMonth}:`}</div>
          <div className={statShowcase}>{earnedString}</div>
          <div className={statDescription}>{`${workedThisMonth}:`}</div>
          <div className={statShowcase}>{hoursWorkedString}</div>
        </div>
      </div>
    );
  }
  return (
    <div className={`${statsContainer} ${loggedIn ? loggedInClass : ""}`}>
      <div className={overflowingContainer}>
        <div className={statDescription}>Loading...</div>
        <div className={statShowcase}>Loading...</div>
        <div className={statDescription}>Loading...</div>
        <div className={statShowcase}>Loading...</div>
      </div>
    </div>
  );
};
