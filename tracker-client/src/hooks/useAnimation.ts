import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useStateRef } from "./useStateRef";

export const useAnimation = <E extends HTMLElement>(
  show: boolean,
  skipAnimation = false,
) => {
  const [render, setRender] = useState<boolean | undefined>(show);
  const mountedRef = useRef(false);
  const prevShow = useRef(show);
  const [showBecameTrue, setShowBecameTrue] = useState(false);
  const ref = useRef<E | null | true>(true);
  const showRef = useRef(show);

  useEffect(() => {
    showRef.current = show;
  }, [show]);

  useLayoutEffect(() => {
    if (skipAnimation) setRender(show);
  }, [setRender, show, skipAnimation]);

  useEffect(() => {
    if (show && !skipAnimation) {
      setRender(true);
    }
    const newShowBecameTrue = show && !prevShow.current;
    if (newShowBecameTrue) setShowBecameTrue(true);
    prevShow.current = show;
  }, [setRender, show, skipAnimation]);

  useEffect(() => {
    //Component might not be rendered if parent component not being rendered
    if (showBecameTrue && !ref.current) {
      setShowBecameTrue(false);
    }
  }, [showBecameTrue]);

  const [animationOngoing, setAnimationOngoing, animationOngoingRef] =
    useStateRef<boolean | undefined>(undefined);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
    } else {
      setAnimationOngoing((animationOngoing) => animationOngoing !== undefined);
    }
  }, [setAnimationOngoing, show]);

  const onAnimationEnd = useCallback(() => {
    if (!showRef.current) {
      setRender(false);
    }
    setAnimationOngoing(false);
    setShowBecameTrue(false);
  }, [setAnimationOngoing]);

  return {
    render,
    onAnimationEnd,
    showBecameTrue,
    ref: ref as React.MutableRefObject<E | null>,
    animationOngoing,
    animationOngoingRef,
  };
};
