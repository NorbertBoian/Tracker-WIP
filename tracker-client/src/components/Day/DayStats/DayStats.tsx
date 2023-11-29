import { useAnimation } from "../../../hooks/useAnimation";
import { languageObjectType } from "../../../languages/en";
import { capitalize } from "../../../utils/capitalize";
import defaultClasses from "./DayStats.module.css";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  shortVersion: boolean;
  hoursWorkedString: string;
  payAmountString: string;
  show: boolean;
  languageObject: languageObjectType;
  customClasses?: Partial<typeof defaultClasses>;
}

export const DayStats = ({
  shortVersion,
  hoursWorkedString,
  show,
  payAmountString,
  languageObject,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    dayStatsComponent,
    hoursWorkedFirstHalf,
    dayStatsInAnimation,
    hoursWorkedSecondHalf,
    payFirstHalf,
    paySecondHalf,
    firstHalvesContainer,
    secondHalvesContainer,
    hide,
  } = combinedClasses;

  const { pay, hours, hoursWorkerd } = languageObject;

  const { render, onAnimationEnd, showBecameTrue } = useAnimation(show);

  const capitalizedHoursString = capitalize(hours);

  return render ? (
    <div
      className={`${dayStatsComponent} ${!show ? hide : ""} ${
        showBecameTrue ? dayStatsInAnimation : ""
      }`}
      onAnimationEnd={onAnimationEnd}
    >
      <div className={firstHalvesContainer}>
        <div className={payFirstHalf}>{pay}</div>
        <div className={hoursWorkedFirstHalf}>
          {shortVersion ? capitalizedHoursString : hoursWorkerd}
        </div>
      </div>
      <div className={secondHalvesContainer}>
        <div className={paySecondHalf}>{`${payAmountString}`}</div>
        <div className={hoursWorkedSecondHalf}>{`${hoursWorkedString}`}</div>
      </div>
    </div>
  ) : null;
};
