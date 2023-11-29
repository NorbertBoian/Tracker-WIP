import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { hourlyRateRegex } from "../../../../../../shared/constants";
import { processRateString } from "../../../../functions/processRateString";
import { TwoColoredInput } from "../../../Shared/TwoColoredInput/TwoColoredInput";
import customClasses from "./HourlyRateInput.module.css";

interface IProps {
  value: string;
  refProp: React.MutableRefObject<HTMLInputElement | null>;
  placeholder: string;
  setValueRef: React.MutableRefObject<
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
  cursor: number[];
  descriptionString: string;
}

export const HourlyRateInput = ({
  value,
  placeholder,
  refProp,
  cursor,
  setValueRef,
  descriptionString,
}: IProps) => {
  // const setProcessedValue = (hourlyRate: string) => {
  //   const processedString = processRateString(hourlyRate, 6);
  //   setValue(processedString);
  // };

  const [hourlyRateValidity, setHourlyRateValidity] = useState(true);

  useEffect(() => {
    setHourlyRateValidity(!!refProp.current?.validity.valid);
  }, [refProp, value]);

  return (
    <TwoColoredInput
      type="decimal"
      monthInput={true}
      valid={hourlyRateValidity}
      value={value}
      placeholder={placeholder}
      expectedPattern={hourlyRateRegex}
      setValueRef={setValueRef}
      cursor={cursor}
      maxLength={6}
      descriptionString={descriptionString}
      customClasses={customClasses}
      refProp={refProp}
    />
  );
};
