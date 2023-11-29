import { useRef, useState } from "react";

export const useStateRef = <T>(
  initialValue: T | (() => T),
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] => {
  const [value, setValue] = useState<T>(initialValue);
  const ref = useRef(value);
  ref.current = value;
  return [value, setValue, ref];
};
