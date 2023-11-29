import { useEffect, useRef } from "react";

interface IProps {
  value: string;
  cursor: number[];
  setValue: (
    value:
      | {
          value: string;
          cursor?: number[];
        }
      | ((value: string) => {
          value: string;
          cursor?: number[];
        }),
  ) => void;

  maxLength: number;
  refProp?:
    | React.RefObject<HTMLInputElement>
    | ((node: HTMLInputElement | null) => void);
  handleFocusRef?: React.MutableRefObject<() => void>;
  handleBlurRef?: React.MutableRefObject<() => void>;
  handleMouseDownRef?: React.MutableRefObject<() => void>;
  [key: string]: any;
}

export const DecimalInput = ({
  value,
  cursor,
  setValue,
  maxLength,
  refProp = undefined,
  handleBlurRef,
  handleFocusRef,
  handleMouseDownRef,
  ...rest
}: IProps) => {
  const ref = useRef(null);
  refProp = refProp ?? ref;

  const onChangeHandlerRef = useRef(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue((value) => {
        const string = event.target.value;
        const pos = event.target.selectionEnd;
        let cursor;
        let processedString = "";
        let index = 0;
        while (processedString.length < maxLength && index < string.length) {
          if (
            !processedString.includes(",") &&
            !processedString.includes(".") &&
            index < maxLength - 1
          ) {
            if (/[.,\d]/.test(string[index])) processedString += string[index];
          } else {
            if (/[\d]/.test(string[index])) processedString += string[index];
          }
          index++;
        }
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
      {...(handleFocusRef ? { onFocus: handleFocusRef.current } : {})}
      {...(handleBlurRef ? { onBlur: handleBlurRef.current } : {})}
      {...(handleMouseDownRef
        ? { onMouseDown: handleMouseDownRef.current }
        : {})}
      value={value}
      ref={refProp}
      onChange={onChangeHandlerRef.current}
      maxLength={maxLength}
      {...rest}
    ></input>
  );
};
