import { useEffect, useState } from "react";
import { overtimeMultiplierRegex } from "../../../../../../shared/constants";
import { TwoColoredInput } from "../../../Shared/TwoColoredInput/TwoColoredInput";
import customClasses from "./OvertimeMultiplierInput.module.css";

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

export const OvertimeMultiplierInput = ({
  value,
  placeholder,
  refProp,
  cursor,
  setValueRef,
  descriptionString,
}: IProps) => {
  const [overtimeMultiplierValidity, setOvertimeMultiplierValidity] =
    useState(true);

  useEffect(() => {
    setOvertimeMultiplierValidity(!!refProp.current?.validity.valid);
  }, [refProp, value]);

  return (
    <TwoColoredInput
      type="decimal"
      valid={overtimeMultiplierValidity}
      value={value}
      placeholder={placeholder}
      expectedPattern={overtimeMultiplierRegex}
      setValueRef={setValueRef}
      cursor={cursor}
      maxLength={5}
      descriptionString={descriptionString}
      customClasses={customClasses}
      refProp={refProp}
    />
  );
};
