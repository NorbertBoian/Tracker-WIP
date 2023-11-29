import {
  Children,
  Key,
  ReactElement,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { monthNumberType } from "../../constants/constants";
import { getRateLimitedFunction } from "../../functions/getRateLimitedFunction";

interface Day extends ReactElement {
  ref?: RefObject<HTMLLIElement>;
}

// type Day = ReactElement<{ refProp?: RefObject<HTMLLIElement> }> | null;

type daysPositions = {
  [key: string]: { x: number; y: number };
};

const getDaysPositions = (
  days: Day[] | Day,
  daysWrapperRef: React.MutableRefObject<HTMLOListElement | null>,
) => {
  const positions: daysPositions = {};
  if (daysWrapperRef.current) {
    const { x: containerX, y: containerY } =
      daysWrapperRef.current.getBoundingClientRect();
    Children.forEach(days, (day) => {
      if (day && day.ref?.current && day.key) {
        const { x: dayX, y: dayY } = day.ref.current.getBoundingClientRect();
        const x = dayX - containerX;
        const y = dayY - containerY;
        Object.assign(positions, { [day.key]: { x, y } });
      }
    });
  }
  return positions;
};

const logThings = (
  string: string,
  key: Key,
  children: Day[] | Day,
  containerRef: React.MutableRefObject<HTMLOListElement | null>,
) => {
  const positionsAfterLayoutShift = getDaysPositions(children, containerRef);
  if (positionsAfterLayoutShift?.[key]) {
    const { x: xAfterLayoutShift, y: yAfterLayoutShift } =
      positionsAfterLayoutShift[key];
    Children.forEach(children, (day) => {
      if (day && day.key === key) {
        if (day.ref?.current) {
          const translate = getComputedStyle(day.ref.current).translate;
          const [translateXString, translateYString] =
            translate !== "none"
              ? `${translate} 0px`.split(" ").slice(0, 2)
              : ["0", "0"];
          const translateX = translateXString.slice(0, -2);
          const translateY = translateYString.slice(0, -2);
          const unshiftedX = xAfterLayoutShift - +translateX;
          const unshiftedY = yAfterLayoutShift - +translateY;
          // console.log(string, {
          //   xAfterLayoutShift,
          //   yAfterLayoutShift,
          //   translateXString,
          //   translateYString,
          //   unshiftedX,
          //   unshiftedY,
          // });
        }
        // else console.log("day.ref.current is undefined");
      }
    });
  }
  // else console.log(string, "positionsAfterLayoutShift[key] undefined");
};

interface IProps {
  daysWrapperRef: React.MutableRefObject<HTMLOListElement | null>;
  children: Day[] | Day;
  month: monthNumberType;
  year: number;
  mountedSettings: boolean;
  email: string | false | undefined;
  onTransitionEnd?: () => void;
  duration?: number;
}

// const getBoundElement = <T,>(element: T) =>
//   element &&
//   typeof element === "object" &&
//   "props" in element &&
//   element.props &&
//   typeof element.props === "object" &&
//   "refProp" in element.props &&
//   element.ref &&
//   typeof element.ref === "object" &&
//   "current" in element.ref &&
//   element.ref.current instanceof HTMLElement
//     ? element.ref.current
//     : undefined;
const getBoundElement = <T,>(element: T) =>
  element &&
  typeof element === "object" &&
  "ref" in element &&
  element.ref &&
  typeof element.ref === "object" &&
  "current" in element.ref &&
  element.ref.current instanceof HTMLElement
    ? element.ref.current
    : undefined;

export const AnimateDays = ({
  children: days,
  month,
  year,
  email,
  daysWrapperRef,
  onTransitionEnd,
  mountedSettings,
  duration = 3370,
}: IProps) => {
  const positionsBeforeLayoutShiftRef = useRef<daysPositions>({});

  // console.log(positionsBeforeLayoutShiftRef.current);
  // logThings("render", "1670544000000", days, daysWrapperRef);
  // logThings("render", "1667952000000", days, daysWrapperRef);

  useLayoutEffect(() => {
    if (onTransitionEnd) {
      const daysElements = Children.map(days, (day) => getBoundElement(day));
      const rateLimitedOnTransitionEnd = getRateLimitedFunction(
        onTransitionEnd,
        200,
        false,
      );
      if (daysElements) {
        daysElements.forEach((dayElement) => {
          if (dayElement) {
            dayElement.addEventListener(
              "transitionend",
              rateLimitedOnTransitionEnd,
            );
          }
        });
        return () => {
          daysElements.forEach((dayElement) => {
            if (dayElement) {
              dayElement.removeEventListener(
                "transitionend",
                rateLimitedOnTransitionEnd,
              );
            }
          });
        };
      }
    }
  }, [days, onTransitionEnd]);

  const skipAnimationRef = useRef(0);

  const prevMountedSettingsRef = useRef(mountedSettings);

  useEffect(() => {
    prevMountedSettingsRef.current = mountedSettings;
  }, [mountedSettings]);

  useLayoutEffect(() => {
    //first rerender has previous month children,next one is updated; possibly not true anymore
    skipAnimationRef.current = 1; //prev month
  }, [month, year, email]);

  useLayoutEffect(() => {
    const positionsAfterLayoutShift = getDaysPositions(days, daysWrapperRef);
    if (
      !skipAnimationRef.current &&
      mountedSettings !== prevMountedSettingsRef.current
    ) {
      Children.forEach(days, (day) => {
        if (
          day &&
          day.key &&
          positionsAfterLayoutShift[day.key] &&
          positionsBeforeLayoutShiftRef.current?.[day.key]
        ) {
          const { x: xAfterLayoutShift, y: yAfterLayoutShift } =
            positionsAfterLayoutShift[day.key];
          const { x: xBeforeLayoutShift, y: yBeforeLayoutShift } =
            positionsBeforeLayoutShiftRef.current[day.key];

          const xShift = xBeforeLayoutShift - xAfterLayoutShift;
          const yShift = yBeforeLayoutShift - yAfterLayoutShift;
          const childElement = day.ref?.current;
          if (
            childElement &&
            positionsAfterLayoutShift[day.key] &&
            positionsBeforeLayoutShiftRef.current[day.key] &&
            (xShift || yShift)
          ) {
            if (getComputedStyle(childElement).translate === "none") {
              if (xShift || yShift) {
                requestAnimationFrame(() => {
                  childElement.style.translate = `${xShift}px ${yShift}px`;
                  childElement.style.transition = "translate 0ms";
                  requestAnimationFrame(() => {
                    childElement.style.translate = "";
                    childElement.style.transition = `translate ${duration}ms`;
                  });
                });
              }
            } else {
              const translate = getComputedStyle(childElement).translate;
              const [translateXString, translateYString] =
                translate !== "none"
                  ? `${translate} 0px`.split(" ").slice(0, 2)
                  : ["0", "0"];
              const translateX = translateXString.slice(0, -2);
              const translateY = translateYString.slice(0, -2);

              const unshiftedX = xAfterLayoutShift - +translateX;
              const unshiftedY = yAfterLayoutShift - +translateY;

              const xShift = xBeforeLayoutShift - unshiftedX;
              const yShift = yBeforeLayoutShift - unshiftedY;

              requestAnimationFrame(() => {
                childElement.style.translate = `${xShift}px ${yShift}px`;
                childElement.style.transition = "translate 0ms";
                requestAnimationFrame(() => {
                  childElement.style.translate = "";
                  childElement.style.transition = `translate ${duration}ms`;
                });
              });
            }
          }
        }
      });
    } else {
      skipAnimationRef.current = skipAnimationRef.current === 1 ? 2 : 0; //current month
    }
    positionsBeforeLayoutShiftRef.current = positionsAfterLayoutShift;
  }, [days, daysWrapperRef, duration, mountedSettings]);

  return <>{days}</>;
};
