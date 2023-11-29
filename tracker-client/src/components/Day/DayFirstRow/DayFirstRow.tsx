import defaultClasses from "./DayFirstRow.module.css";
import statsButtonIcon from "./assets/statsButtonIcon.svg";
import { defaultButton } from "../../../sharedStyles.module.css";
import { hsvToRgb, rgbToHex } from "../../../utils/colorConversions";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  firstRowWrapperRef?: React.MutableRefObject<null | HTMLDivElement>;
  dayNameElementRef?: React.MutableRefObject<null | HTMLDivElement>;
  dayNameColor: string | [number, number, number];
  weekdayString: string;
  showDaySettings: boolean;
  customClasses?: Partial<typeof defaultClasses>;
  handleToggleDayStatsRef: React.MutableRefObject<() => void>;
}

export const DayFirstRow = ({
  firstRowWrapperRef = undefined,
  customClasses = {},
  dayNameColor,
  dayNameElementRef = undefined,
  weekdayString,
  showDaySettings,
  handleToggleDayStatsRef,
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    firstRowWrapper,
    toggleStatsButtonContainer,
    rightSpaceTaker,
    leftSpaceTaker,
    zeroWidth,
  } = combinedClasses;

  const dayNameColorString =
    typeof dayNameColor === "string"
      ? dayNameColor
      : rgbToHex(hsvToRgb(dayNameColor));

  return (
    <div
      className={firstRowWrapper}
      {...(firstRowWrapperRef ? { ref: firstRowWrapperRef } : {})}
    >
      {/* <button
        type="button"
        onClick={handleToggleDayStatsRef.current}
        className={`${defaultButton} ${toggleStatsButtonContainer}`}
      >
        <img src={statsButtonIcon} alt="" />
      </button> */}
      <div className={leftSpaceTaker}></div>
      <h5
        {...(dayNameElementRef ? { ref: dayNameElementRef } : {})}
        style={{ color: dayNameColorString }}
      >
        {weekdayString}
      </h5>
      <div
        className={`${rightSpaceTaker} ${showDaySettings ? zeroWidth : ""}`}
      ></div>
    </div>
  );
};
