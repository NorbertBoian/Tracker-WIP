import { useEffect, useRef } from "react";

export const useFocus = (active: false | "top" | "bottom") => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (active && ref.current instanceof HTMLInputElement) {
      ref.current.focus();
      ref.current.select();
    }
  }, [active]);

  return ref;
};
