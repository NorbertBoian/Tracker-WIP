import defaultClasses from "./DayStatusIndicator.module.css";

export type customClasssesType = Partial<typeof defaultClasses>;

interface IProps {
  verifiedStatus: "good" | "bad" | "neutral";
  customClasses?: Partial<typeof defaultClasses>;
}

export const DayStatusIndicator = ({
  verifiedStatus,
  customClasses = {},
}: IProps) => {
  const combinedClasses = { ...defaultClasses, ...customClasses };
  const { dayStatusIndicator, neutralColor, badColor, goodColor } =
    combinedClasses;

  const statusColorClass =
    verifiedStatus === "good"
      ? goodColor
      : verifiedStatus === "bad"
      ? badColor
      : neutralColor;

  return <div className={`${dayStatusIndicator} ${statusColorClass}`}></div>;
};
