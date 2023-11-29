import { useRef, useState } from "react";

export const useFocusOutline = () => {
  const [inputisFocused, setInputisFocused] = useState(false);
  const focusWasTriggeredByClickRef = useRef(false);

  const onInputMouseDownRef = useRef(() => {
    focusWasTriggeredByClickRef.current = true;
  });

  const onInputFocusRef = useRef(() => {
    if (!focusWasTriggeredByClickRef.current) {
      setInputisFocused(true);
    } else {
      focusWasTriggeredByClickRef.current = false;
    }
  });

  const onInputBlurRef = useRef(() => {
    setInputisFocused(false);
  });

  return {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  };
};
