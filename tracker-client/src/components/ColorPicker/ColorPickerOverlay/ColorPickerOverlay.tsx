import {
  useEffect,
  useLayoutEffect,
  useRef,
  KeyboardEvent,
  useCallback,
  useState,
} from "react";
import { emptyObject } from "../../../constants/constants";
import { hsvToRgb } from "../../../utils/colorConversions";
import { getColorPickerOverlayPositionType } from "../../ApplicationSettings/ApplicationDaySettings/functions/getColorPickerOverlayPositionCreator";
import { getShouldShowAsModalType } from "../../ApplicationSettings/ApplicationDaySettings/functions/getShouldShowAsModalCreator";
import defaultClasses from "./ColorPickerOverlay.module.css";
import { useMouseInteractions } from "./hooks/useMouseInteractions";
export type customClasssesType = Partial<typeof defaultClasses>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface IProps {
  colorPreviewRef: React.MutableRefObject<HTMLDivElement | null>;
  setHsvColor: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  hsvColor: [number, number, number];
  setShowColorPickerOverlayAsModal: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  showingColorPickerOverlayAsModalRef: React.MutableRefObject<
    boolean | undefined
  >;
  colorPickerOverlayMountCallback?: (
    setShowColorPickerOverlay: (boolean: boolean) => void,
  ) => void;
  colorPickerOverlayUnmountCallback?: typeof noop;
  getShouldShowAsModal: getShouldShowAsModalType;
  getColorPickerOverlayPosition: getColorPickerOverlayPositionType;
  customClasses?: Partial<typeof defaultClasses>;
  scrollableAreaRef?: React.MutableRefObject<HTMLDivElement | null>;
  setShowOverlayAndResetShowModal: React.Dispatch<
    React.SetStateAction<boolean | 2>
  >;
  priorityFocusedElementRef?:
    | React.MutableRefObject<HTMLElement | null | undefined>
    | false;
  trapFocus?: boolean;
  rerenderOverlay: never[];
  id: string;
}

export const ColorPickerOverlay = ({
  colorPreviewRef,
  id,
  setHsvColor,
  hsvColor,
  trapFocus = true,
  priorityFocusedElementRef = false,
  setShowColorPickerOverlayAsModal,
  showingColorPickerOverlayAsModalRef,
  customClasses = emptyObject,
  colorPickerOverlayMountCallback = noop,
  colorPickerOverlayUnmountCallback = noop,
  getShouldShowAsModal = () => true,
  rerenderOverlay,
  getColorPickerOverlayPosition = () => false,
  scrollableAreaRef = undefined,
  setShowOverlayAndResetShowModal,
  debug,
}: IProps) => {
  const arrowIndicatorRef = useRef<HTMLDivElement | null>(null);
  const colorPickerOverlayNodeRef = useRef<HTMLDialogElement | null>(null);

  const combinedClasses = { ...defaultClasses, ...customClasses };

  const {
    arrowIndicator,
    noArrow,
    bottomArrow,
    topArrow,
    rightArrow,
    leftArrow,
    colorPickerOverlayContainer,
    sliderAndMainGradientContainer,
    mainGradientAndDotContainer,
    mainGradient,
    hueSliderContainer,
    hueGradient,
    line,
    dot,
    sliderAndMainGradientContainerBackground,
    mainGradientDimensions,
    hueGradientDimensions,
    colorPickerOverlayContainerPosition,
  } = combinedClasses;

  useEffect(() => {
    colorPickerOverlayMountCallback(setShowOverlayAndResetShowModal);
    return () => {
      colorPickerOverlayUnmountCallback();
    };
  }, [
    colorPickerOverlayMountCallback,
    colorPickerOverlayUnmountCallback,
    setShowOverlayAndResetShowModal,
  ]);

  const updateOverlayAppeareanceRef = useRef(() => {
    if (
      colorPickerOverlayNodeRef &&
      colorPickerOverlayNodeRef.current &&
      arrowIndicatorRef.current
    ) {
      const viewportWidth = window.document.documentElement.clientWidth;
      const viewportHeight = window.document.documentElement.clientHeight;
      const shouldShowAsModal = getShouldShowAsModal(
        colorPickerOverlayNodeRef,
        colorPreviewRef,
        viewportWidth,
        viewportHeight,
      );
      if (showingColorPickerOverlayAsModalRef.current) {
        if (!shouldShowAsModal) {
          colorPickerOverlayNodeRef.current.style.top = "";
          colorPickerOverlayNodeRef.current.style.left = "";
          arrowIndicatorRef.current.className = `${arrowIndicator} ${noArrow}`;
          setShowColorPickerOverlayAsModal(false);
        }
      } else {
        if (shouldShowAsModal) {
          if (showingColorPickerOverlayAsModalRef.current !== undefined) {
            setShowOverlayAndResetShowModal(false);
          } else {
            setShowColorPickerOverlayAsModal(true);
          }
        } else {
          if (showingColorPickerOverlayAsModalRef.current === undefined)
            setShowColorPickerOverlayAsModal(false);
          const colorPickerOverlayPosition = getColorPickerOverlayPosition(
            colorPickerOverlayNodeRef,
            colorPreviewRef,
            viewportWidth,
            viewportHeight,
          );
          if (colorPickerOverlayPosition) {
            const { verticalPosition, horizontalPosition, positionsValues } =
              colorPickerOverlayPosition;

            const arrowPositionClasses = {
              top: bottomArrow,
              bottom: topArrow,
              left: rightArrow,
              right: leftArrow,
            };

            const horizontalArrowPositionClass =
              arrowPositionClasses[verticalPosition];

            const verticalArrowPositionClass =
              arrowPositionClasses[horizontalPosition];

            arrowIndicatorRef.current.className = `${arrowIndicator} ${horizontalArrowPositionClass} ${verticalArrowPositionClass}`;

            const position = {
              top: `${positionsValues.vertical}px`,
              left: `${positionsValues.horizontal}px`,
            };
            // colorPickerOverlayNodeRef.current.style.translate = `${position.left} ${position.top}`; Translate makes overlay blurry

            colorPickerOverlayNodeRef.current.style.inset = `${position.top} auto auto ${position.left}`;
          }
        }
      }
    }
  });

  useEffect(() => {
    const scrollableAreaElement = scrollableAreaRef?.current;
    const handleThings = updateOverlayAppeareanceRef.current;
    window.addEventListener("resize", handleThings);
    if (scrollableAreaElement)
      scrollableAreaElement.addEventListener("scroll", handleThings);
    return () => {
      window.removeEventListener("resize", handleThings);
      if (scrollableAreaElement)
        scrollableAreaElement.removeEventListener("scroll", handleThings);
    };
  }, [updateOverlayAppeareanceRef, scrollableAreaRef]);

  useLayoutEffect(() => {
    updateOverlayAppeareanceRef.current();
  }, [rerenderOverlay]);

  const mainGradientRef = useRef<null | HTMLDivElement>(null);
  const lineRef = useRef<null | HTMLDivElement>(null);
  const dotRef = useRef<null | HTMLDivElement>(null);

  const {
    hueSliderContainerRef,
    mainGradientAndDotContainerRef,
    handleMouseDownAndMouseMoveRef,
  } = useMouseInteractions(setHsvColor, scrollableAreaRef);

  useEffect(() => {
    if (
      mainGradientRef.current &&
      hueSliderContainerRef.current &&
      lineRef.current &&
      dotRef.current &&
      mainGradientAndDotContainerRef.current
    ) {
      const hue = hsvColor[0];
      const saturation = hsvColor[1];
      const brightness = hsvColor[2];

      const rgb = hsvToRgb(hsvColor);
      const red = rgb[0];
      const green = rgb[1];
      const blue = rgb[2];
      mainGradientRef.current.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hue}, 100%, 50%)`;

      const hueSliderContainerRect =
        hueSliderContainerRef.current.getBoundingClientRect();
      const { height: hueSliderContainerHeight } = hueSliderContainerRect;

      const lineRefRect = lineRef.current.getBoundingClientRect();
      const { height: lineHeight } = lineRefRect;

      lineRef.current.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

      lineRef.current.style.top = `${
        (hue / 360) * hueSliderContainerHeight - Math.floor(lineHeight / 2)
      }px`;

      const mainGradientAndDotContainerRect =
        mainGradientAndDotContainerRef.current.getBoundingClientRect();

      const {
        width: mainGradientAndDotContainerWidth,
        height: mainGradientAndDotContainerHeight,
      } = mainGradientAndDotContainerRect;

      const dotRefRect = dotRef.current.getBoundingClientRect();
      const { height: dotHeight, width: dotWidth } = dotRefRect;

      dotRef.current.style.left = `${
        saturation * mainGradientAndDotContainerHeight -
        Math.floor(dotHeight / 2)
      }px`;

      dotRef.current.style.top = `${
        (1 - brightness) * mainGradientAndDotContainerWidth -
        Math.floor(dotWidth / 2)
      }px`;

      dotRef.current.style.backgroundColor = `rgb(${red}, ${green}, ${blue})`;
    }
  }, [hsvColor, hueSliderContainerRef, mainGradientAndDotContainerRef]);

  useEffect(() => {
    const focusedElementAtMount = document.activeElement;
    mainGradientAndDotContainerRef.current?.focus();
    return () => {
      if (focusedElementAtMount instanceof HTMLElement)
        focusedElementAtMount.focus();
    };
  }, [mainGradientAndDotContainerRef]);

  const handleKeyDownDot = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && trapFocus) {
        event.preventDefault();
        hueSliderContainerRef.current?.focus();
      } else {
        switch (event.key) {
          case "ArrowDown":
            {
              setHsvColor((hsvColor) => {
                const cappedBrightness = Math.max(
                  Math.min(hsvColor[2] - 0.01, 1),
                  0,
                );
                return [hsvColor[0], hsvColor[1], cappedBrightness];
              });
            }
            break;
          case "ArrowUp":
            {
              setHsvColor((hsvColor) => {
                const cappedBrightness = Math.max(
                  Math.min(hsvColor[2] + 0.01, 1),
                  0,
                );
                return [hsvColor[0], hsvColor[1], cappedBrightness];
              });
            }
            break;
          case "ArrowLeft":
            {
              setHsvColor((hsvColor) => {
                const cappedSaturation = Math.max(
                  Math.min(hsvColor[1] - 0.01, 1),
                  0,
                );
                return [hsvColor[0], cappedSaturation, hsvColor[2]];
              });
            }
            break;
          case "ArrowRight":
            {
              setHsvColor((hsvColor) => {
                const cappedSaturation = Math.max(
                  Math.min(hsvColor[1] + 0.01, 1),
                  0,
                );
                return [hsvColor[0], cappedSaturation, hsvColor[2]];
              });
            }
            break;
          case " ": //Fall through
          case "Enter":
            setShowOverlayAndResetShowModal(false);
            break;
        }
      }
    },
    [
      hueSliderContainerRef,
      setHsvColor,
      setShowOverlayAndResetShowModal,
      trapFocus,
    ],
  );

  const handleKeyDownLine = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && trapFocus) {
        event.preventDefault();
        mainGradientAndDotContainerRef.current?.focus();
      } else {
        switch (event.key) {
          case "ArrowRight":
            {
              setHsvColor((hsvColor) => {
                const cappedHue = Math.max(Math.min(hsvColor[0] + 1, 360), 0);
                return [cappedHue, hsvColor[1], hsvColor[2]];
              });
            }
            break;
          case "ArrowLeft":
            {
              setHsvColor((hsvColor) => {
                const cappedHue = Math.max(Math.min(hsvColor[0] - 1, 360), 0);
                return [cappedHue, hsvColor[1], hsvColor[2]];
              });
            }
            break;
          case "ArrowDown":
            {
              setHsvColor((hsvColor) => {
                const cappedHue = Math.max(Math.min(hsvColor[0] + 5, 360), 0);
                return [cappedHue, hsvColor[1], hsvColor[2]];
              });
            }
            break;
          case "ArrowUp":
            {
              setHsvColor((hsvColor) => {
                const cappedHue = Math.max(Math.min(hsvColor[0] - 5, 360), 0);
                return [cappedHue, hsvColor[1], hsvColor[2]];
              });
            }
            break;
          case " ": //Fall through
          case "Enter":
            setShowOverlayAndResetShowModal(false);
            break;
        }
      }
    },
    [
      mainGradientAndDotContainerRef,
      setHsvColor,
      setShowOverlayAndResetShowModal,
      trapFocus,
    ],
  );

  const handleClickRef = useRef(() => {
    if (priorityFocusedElementRef)
      priorityFocusedElementRef.current =
        mainGradientAndDotContainerRef.current;
  });

  return (
    <dialog
      open={true}
      id={`${id}Overlay`}
      role="presentation"
      className={`${colorPickerOverlayContainer} ${colorPickerOverlayContainerPosition}`}
      ref={colorPickerOverlayNodeRef}
      onClick={handleClickRef.current}
    >
      <div
        className={`${sliderAndMainGradientContainer} ${sliderAndMainGradientContainerBackground}`}
      >
        <button
          type="button"
          ref={mainGradientAndDotContainerRef}
          aria-valuetext={`Hue: ${Math.floor(
            hsvColor[0],
          )}, Saturation: ${Math.floor(hsvColor[1] * 100)}, Value: ${Math.floor(
            hsvColor[2] * 100,
          )}`}
          role="slider"
          aria-label="Saturation and Value"
          aria-valuenow={undefined}
          className={mainGradientAndDotContainer}
          onKeyDown={handleKeyDownDot}
          onMouseDown={handleMouseDownAndMouseMoveRef.current}
          onTouchStart={handleMouseDownAndMouseMoveRef.current}
        >
          <div
            ref={mainGradientRef}
            className={`${mainGradient} ${mainGradientDimensions}`}
          ></div>
          <div role="presentation" ref={dotRef} className={dot}></div>
        </button>
        <button
          ref={hueSliderContainerRef}
          type="button"
          aria-orientation="vertical"
          role="slider"
          aria-valuemin={0}
          aria-valuenow={hsvColor[0] * 360}
          aria-valuetext={`Hue: ${Math.floor(
            hsvColor[0],
          )}, Saturation: ${Math.floor(hsvColor[1] * 100)}, Value: ${Math.floor(
            hsvColor[2] * 100,
          )}`}
          aria-valuemax={360}
          aria-label="Hue"
          onKeyDown={handleKeyDownLine}
          className={hueSliderContainer}
          onMouseDown={handleMouseDownAndMouseMoveRef.current}
          onTouchStart={handleMouseDownAndMouseMoveRef.current}
        >
          <div className={`${hueGradient} ${hueGradientDimensions}`}></div>
          <div role="presentation" ref={lineRef} className={line}></div>
        </button>
      </div>
      <div
        ref={arrowIndicatorRef}
        className={`${arrowIndicator} ${noArrow}`}
      ></div>
    </dialog>
  );
};
