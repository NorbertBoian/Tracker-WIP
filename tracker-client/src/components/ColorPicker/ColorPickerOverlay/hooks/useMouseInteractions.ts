import {
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  useEffect,
  useRef,
} from "react";

export const useMouseInteractions = (
  setHsvColor: React.Dispatch<React.SetStateAction<[number, number, number]>>,
  scrollableAreaRef?: React.MutableRefObject<HTMLDivElement | null>,
) => {
  const isHueSliderMouseDownRef = useRef(false);
  const isMainGradientMouseDownRef = useRef(false);

  const hueSliderContainerRef = useRef<HTMLButtonElement | null>(null);
  const mainGradientAndDotContainerRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseDownAndMouseMoveRef = useRef(
    (event: MouseEvent | TouchEvent | ReactMouseEvent | ReactTouchEvent) => {
      if (
        scrollableAreaRef?.current &&
        (event.type === "mousedown" || event.type === "touchstart")
      )
        scrollableAreaRef.current.style.overflowY = "hidden";
      const isMobile = "changedTouches" in event;
      const { clientY: mouseY, clientX: mouseX } = isMobile
        ? event.changedTouches[0]
        : event;

      if (
        !isMobile &&
        (isMainGradientMouseDownRef.current || isHueSliderMouseDownRef.current)
      ) {
        event.preventDefault();
      }

      if (hueSliderContainerRef.current === event.currentTarget) {
        isMainGradientMouseDownRef.current = false;
        isHueSliderMouseDownRef.current = true;
      }
      if (isHueSliderMouseDownRef.current && hueSliderContainerRef.current) {
        const hueSliderContainerRect =
          hueSliderContainerRef.current.getBoundingClientRect();
        const { y: hueSliderContainerY, height: hueSliderContainerHeight } =
          hueSliderContainerRect;

        const mouseYInsideHueSliderContainer = mouseY - hueSliderContainerY;

        const hue =
          (mouseYInsideHueSliderContainer / hueSliderContainerHeight) * 360;

        const cappedHue = Math.max(Math.min(hue, 360), 0);

        setHsvColor((hsvColor) => [cappedHue, hsvColor[1], hsvColor[2]]);
      } else if (
        mainGradientAndDotContainerRef.current === event.currentTarget
      ) {
        isHueSliderMouseDownRef.current = false;
        isMainGradientMouseDownRef.current = true;
      }
      if (
        isMainGradientMouseDownRef.current &&
        mainGradientAndDotContainerRef.current
      ) {
        const mainGradientAndDotContainerRect =
          mainGradientAndDotContainerRef.current.getBoundingClientRect();
        const {
          x: mainGradientAndDotContainerX,
          y: mainGradientAndDotContainerY,
          width: mainGradientAndDotContainerWidth,
          height: mainGradientAndDotContainerHeight,
        } = mainGradientAndDotContainerRect;

        const mouseXInsideMainGradientAndDotContainer =
          mouseX - mainGradientAndDotContainerX;

        const mouseYInsideMainGradientAndDotContainer =
          mouseY - mainGradientAndDotContainerY;

        const saturation =
          mouseXInsideMainGradientAndDotContainer === 0
            ? 0
            : mouseXInsideMainGradientAndDotContainer /
              mainGradientAndDotContainerWidth;
        const brightness =
          1 -
          mouseYInsideMainGradientAndDotContainer /
            mainGradientAndDotContainerHeight;
        const cappedSaturation = Math.max(Math.min(saturation, 1), 0);

        const cappedBrightness = Math.max(Math.min(brightness, 1), 0);

        setHsvColor((hsvColor) => [
          hsvColor[0],
          cappedSaturation,
          cappedBrightness,
        ]);
      }
    },
  );

  const handleMouseUpRef = useRef(() => {
    if (scrollableAreaRef?.current)
      scrollableAreaRef.current.style.overflowY = "auto";
    isMainGradientMouseDownRef.current = false;
    isHueSliderMouseDownRef.current = false;
  });

  useEffect(() => {
    const handleMouseDownAndMouseMove = handleMouseDownAndMouseMoveRef.current;
    const handleMouseUp = handleMouseUpRef.current;

    window.document.body.addEventListener(
      "mousemove",
      handleMouseDownAndMouseMove,
    );
    window.document.body.addEventListener(
      "touchmove",
      handleMouseDownAndMouseMove,
    );
    window.document.body.addEventListener("mouseup", handleMouseUp);
    window.document.body.addEventListener("touchend", handleMouseUp);
    return () => {
      window.document.body.removeEventListener(
        "mousemove",
        handleMouseDownAndMouseMove,
      );
      window.document.body.removeEventListener(
        "touchmove",
        handleMouseDownAndMouseMove,
      );
      window.document.body.removeEventListener("mouseup", handleMouseUp);
      window.document.body.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return {
    hueSliderContainerRef,
    mainGradientAndDotContainerRef,
    handleMouseDownAndMouseMoveRef,
  };
};
