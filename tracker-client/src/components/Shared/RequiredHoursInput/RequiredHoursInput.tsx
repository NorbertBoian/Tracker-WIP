import { useEffect, useRef } from "react";

interface IProps {
  value: string;
  cursor: number[];
  setValue: (
    value:
      | { value: string; cursor?: number[] }
      | ((value: string) => { value: string; cursor?: number[] }),
  ) => void;
  refProp?: React.MutableRefObject<HTMLInputElement | null>;
  [key: string]: any;
}

export const RequiredHoursInput = ({
  value,
  setValue,
  cursor,
  refProp = undefined,
  ...rest
}: IProps) => {
  const ref = useRef(null);
  refProp = refProp ?? ref;
  const onChangeHandlerRef = useRef(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue((value) => {
        let string = event.target.value;
        const pos = event.target.selectionEnd;
        let cursor;
        let processedString = "";
        const firstCharacterIndex = string.search(/\d/);
        processedString += string[firstCharacterIndex] ?? "";
        string = string.slice(firstCharacterIndex + 1);
        if (processedString === "2")
          processedString += string[string.search(/[0-4]/)] ?? "";
        else if (processedString === "0" || processedString === "1")
          processedString += string[string.search(/\d/)] ?? "";
        if (processedString === value) {
          cursor = { cursor: [(pos ?? 1) - 1] };
        }
        return { value: processedString, ...(cursor ?? {}) };
      });
    },
  );

  useEffect(() => {
    refProp?.current?.setSelectionRange(cursor[0], cursor[0]);
  }, [cursor, refProp]);

  return (
    <input
      value={value}
      ref={refProp}
      onChange={onChangeHandlerRef.current}
      maxLength={2}
      {...rest}
    ></input>
  );
};
