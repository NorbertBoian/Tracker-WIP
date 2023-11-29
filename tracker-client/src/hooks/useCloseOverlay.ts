import { useRef, MouseEvent as ReactMouseEvent } from "react";
import { isDescendant } from "../utils/isDescendant";
import { useStateRef } from "./useStateRef";

export const useCloseOverlay = <E extends HTMLElement>(
  checkForDescendants = true,
  customShowOverlayRef?: React.MutableRefObject<boolean | 2>,
  customSetShowOverlay?: React.Dispatch<React.SetStateAction<boolean | 2>>,
  customOverlayRef?: React.MutableRefObject<E | null>,
) => {
  customSetShowOverlay = customSetShowOverlay
    ? customSetShowOverlay
    : undefined;
  const ref = useRef<E | null>(null);
  const overlayRef = customOverlayRef ?? ref;
  const [defaultShowOverlay, defaultSetShowOverlay, defaultShowOverlayRef] =
    useStateRef<boolean | 2>(false);
  const showOverlay = customSetShowOverlay ? false : defaultShowOverlay;
  const setShowOverlay = customSetShowOverlay
    ? customSetShowOverlay
    : defaultSetShowOverlay;
  const showOverlayRef = customShowOverlayRef
    ? customShowOverlayRef
    : defaultShowOverlayRef;
  const mouseDownHandlerRef = useRef((event: MouseEvent | ReactMouseEvent) => {
    const targetElement = event.target;
    const overlayElement = overlayRef.current;
    if (
      !checkForDescendants ||
      (targetElement instanceof HTMLElement &&
        !isDescendant(overlayElement, targetElement))
    ) {
      if (event.button === 2)
        setShowOverlay((prevShowOverlay) => (prevShowOverlay ? 2 : false));
      else if (showOverlayRef.current === 2) setShowOverlay(true);
      else setShowOverlay(false);
    }
  });
  return {
    mouseDownHandlerRef,
    showOverlay,
    setShowOverlay,
    overlayRef,
    showOverlayRef,
  };
};
