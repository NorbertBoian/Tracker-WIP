import {
  useEffect,
  useRef,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  TouchEvent as ReactTouchEvent,
  useCallback,
} from "react";
import {
  sliderComponent,
  sliderValueDisplay,
  sliderBar,
  sliderProgress,
  sliderDot,
  sliderWrapper,
} from "./Slider.module.css";

interface IProps {
  value: number;
  interval: [number, number];
  setValue: React.Dispatch<React.SetStateAction<number>>;
  units: string;
  scrollableAreaRef?: React.MutableRefObject<HTMLElement | null>;
}

export const Slider = ({
  value,
  interval,
  setValue,
  units,
  scrollableAreaRef,
}: IProps) => {
  const sliderBarNodeRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const sliderProgressBarRef = useRef<HTMLDivElement | null>(null);

  const isSliderMouseDownRef = useRef(false);

  const handleMouseMoveRef = useRef((event: MouseEvent | TouchEvent) => {
    const isMobile = "changedTouches" in event;
    if (!isMobile && isSliderMouseDownRef.current) {
      event.preventDefault();
    }
    if (
      isSliderMouseDownRef.current &&
      sliderBarNodeRef.current &&
      dotRef.current &&
      sliderProgressBarRef.current
    ) {
      const coordinates = sliderBarNodeRef.current.getBoundingClientRect();
      const { x, width } = coordinates;
      const { clientX } = isMobile ? event.changedTouches[0] : event;
      const sliderX = Math.max(Math.min(clientX - x, width), 0);
      const percentValue = sliderX / width;
      const intervalDelta = interval[1] - interval[0];
      const value = Math.round(interval[0] + percentValue * intervalDelta);
      setValue(value);
    }
  });

  const handleSliderMouseDownRef = useRef(
    (event: ReactMouseEvent | ReactTouchEvent) => {
      if (
        sliderBarNodeRef.current &&
        dotRef.current &&
        sliderProgressBarRef.current
      ) {
        if (scrollableAreaRef?.current)
          scrollableAreaRef.current.style.overflowY = "hidden";
        const isMobile = "changedTouches" in event;
        const coordinates = sliderBarNodeRef.current.getBoundingClientRect();
        const { x, width } = coordinates;
        const { clientX } = isMobile ? event.changedTouches[0] : event;
        const sliderX = clientX - x;
        isSliderMouseDownRef.current = true;
        const percentValue = sliderX / width;
        const intervalDelta = interval[1] - interval[0];
        const value = Math.round(interval[0] + percentValue * intervalDelta);
        setValue(value);
      }
    },
  );

  useEffect(() => {
    if (dotRef.current && sliderProgressBarRef.current) {
      const intervalDelta = interval[1] - interval[0];
      const newPercentValue = (value - interval[0]) / intervalDelta;
      sliderProgressBarRef.current.style.width = `${newPercentValue * 100}%`;
      dotRef.current.style.left = `calc(${newPercentValue * 100}% - ${
        Math.floor(dotRef.current.offsetWidth) / 2
      }px)`;
    }
  }, [interval, value]);

  const handleMouseUpRef = useRef(() => {
    if (scrollableAreaRef?.current)
      scrollableAreaRef.current.style.overflowY = "auto";
    isSliderMouseDownRef.current = false;
  });

  useEffect(() => {
    const handleMouseUp = handleMouseUpRef.current;
    const handleMouseMove = handleMouseMoveRef.current;
    window.document.body.addEventListener("touchmove", handleMouseMove);
    window.document.body.addEventListener("mousemove", handleMouseMove);
    window.document.body.addEventListener("mouseup", handleMouseUp);
    window.document.body.addEventListener("touchend", handleMouseUp);
    return () => {
      window.document.body.removeEventListener("touchmove", handleMouseMove);
      window.document.body.removeEventListener("mousemove", handleMouseMove);
      window.document.body.removeEventListener("mouseup", handleMouseUp);
      window.document.body.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        case "ArrowLeft":
          setValue((value) => Math.max(value - 1, interval[0]));
          break;
        case "ArrowRight":
          setValue((value) => Math.min(value + 1, interval[1]));
          break;
        case "ArrowUp":
          setValue((value) => Math.min(value + 5, interval[1]));
          break;
        case "ArrowDown":
          setValue((value) => Math.max(value - 5, interval[0]));
          break;
      }
    },
    [interval, setValue],
  );

  return (
    <div
      className={sliderComponent}
      // ref={sliderComponentRef.current}
    >
      <div className={sliderValueDisplay}>{`${value} ${units}`}</div>
      <button
        className={sliderWrapper}
        onMouseDown={handleSliderMouseDownRef.current}
        onTouchStart={handleSliderMouseDownRef.current}
        type="button"
        role="slider"
        aria-valuemin={interval[0]}
        aria-valuenow={value}
        aria-valuetext={`${value} ${units}`}
        aria-valuemax={interval[1]}
        aria-labelledby="autosaveLabel"
        onKeyDown={onKeyDown}
      >
        <div ref={sliderBarNodeRef} className={sliderBar}>
          <div ref={sliderProgressBarRef} className={sliderProgress}></div>
        </div>
        <div role="presentation" className={sliderDot} ref={dotRef}></div>
      </button>
    </div>
  );
};
