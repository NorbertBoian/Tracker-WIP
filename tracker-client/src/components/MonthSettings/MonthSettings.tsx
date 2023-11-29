import {
  MouseEvent,
  useRef,
  FormEvent,
  useLayoutEffect,
  useCallback,
  ReactElement,
  RefObject,
  KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  monthSettingsComponent,
  monthSettingsContainer,
  monthSettingsFormWrapper,
  monthSettingsPlaceholder,
  mounted,
  unmounted,
  skipAnimation,
  isModal as isModalClass,
  modal as modalClass,
} from "./MonthSettings.module.css";
import { MonthSettingsHeader } from "./MonthSettingsHeader/MonthSettingsHeader";
import { MonthSettingsFooter } from "./MonthSettingsFooter/MonthSettingsFooter";
import { MonthSettingsScrollableArea } from "./MonthSettingsScrollableArea/MonthSettingsScrollableArea";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { monthSettingsChanged } from "../../slices/monthSettingsSlice";
import { useAnimation } from "../../hooks/useAnimation";
import { useStateRef } from "../../hooks/useStateRef";
import { AnimateDays } from "../Month/AnimateDays";
import { monthNumberType } from "../../constants/constants";

interface IProps {
  setShowMonthSettings: (boolean: boolean | 2) => void;
  showMonthSettings: boolean | 2;
  mouseDownHandlerRef: React.MutableRefObject<(event: MouseEvent) => void>;
  overlayRef: React.MutableRefObject<HTMLFormElement | null>;
  monthListItemRef: React.MutableRefObject<HTMLLIElement | null>;
  headerRef: React.MutableRefObject<HTMLElement | null>;
  showMonthSettingsRef: React.MutableRefObject<boolean | 2>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
  setMountedSettings: React.Dispatch<React.SetStateAction<boolean>>;
  skipAnimation: boolean;
  modal: boolean;
  handleAnimationEnd: () => void;
  daysWrapperRef: React.MutableRefObject<HTMLOListElement | null>;
  days: Day[] | Day;
  month: monthNumberType;
  year: number;
  email: string | false | undefined;
}

interface Day extends ReactElement {
  ref?: RefObject<HTMLLIElement>;
}

export const MonthSettingsAndDaysWrapper = (
  props: Omit<
    IProps,
    | "handleAnimationEnd"
    | "monthListItemRef"
    | "headerRef"
    | "skipAnimation"
    | "modal"
    | "setMountedSettings"
  >,
) => {
  const {
    showMonthSettings,
    setShowMonthSettings,
    overlayRef,
    daysWrapperRef,
    month,
    year,
    email,
    days,
  } = props;
  const monthListItemRef = useRef<HTMLLIElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const isModalElementRef = useRef<HTMLDivElement>(null);
  const [isModal, setIsModal, isModalRef] = useStateRef(false);
  const [skipAnimation, setSkipAnimation] = useState(false);
  const { render, onAnimationEnd } = useAnimation(!!showMonthSettings, isModal);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setIsModal(!!entries[0].contentRect.width);
    });
    const isModalElement = isModalElementRef.current;
    if (isModalElement) {
      resizeObserver.observe(isModalElement);
      return () => {
        resizeObserver.unobserve(isModalElement);
      };
    }
  }, [setIsModal, render]);

  useEffect(() => {
    if (monthListItemRef.current && overlayRef.current && headerRef.current) {
      if (!showMonthSettings && !isModal) {
        overlayRef.current.style.width = `${overlayRef.current.offsetWidth}px`;
        overlayRef.current.style.height = `${overlayRef.current.offsetHeight}px`;
        overlayRef.current.style.marginRight = `${
          document.body.offsetWidth -
          headerRef.current.getBoundingClientRect().right
        }px`;
        if (monthListItemRef.current.parentElement) {
          monthListItemRef.current.style.marginTop = `${
            overlayRef.current.getBoundingClientRect().y -
            monthListItemRef.current.parentElement.getBoundingClientRect().y
          }px`;
        }
        monthListItemRef.current.style.position = "absolute";
        overlayRef.current.style.minHeight = "";
      } else {
        monthListItemRef.current.style.marginTop = "";
        monthListItemRef.current.style.position = "";
        overlayRef.current.style.width = "";
        overlayRef.current.style.height = "";
        overlayRef.current.style.marginRight = "";
        overlayRef.current.style.minHeight = "";
      }
    }
  }, [isModal, overlayRef, showMonthSettings]);

  const prevIsModalRef = useRef<boolean | undefined>(undefined);

  useLayoutEffect(() => {
    if (prevIsModalRef.current === false && isModal) {
      setShowMonthSettings(false);
    } else if (isModal) {
      setShowMonthSettings(!!showMonthSettings);
    }
  }, [isModal, setShowMonthSettings, showMonthSettings]);

  useEffect(() => {
    setSkipAnimation(true);
    prevIsModalRef.current = isModal;
  }, [isModal]);

  useEffect(() => {
    if (!isModalRef.current) setSkipAnimation(false);
  }, [isModalRef, showMonthSettings]);

  const [mountedSettings, setMountedSettings] = useState(false);

  return (
    <>
      {render ? (
        <MonthSettings
          {...props}
          handleAnimationEnd={onAnimationEnd}
          monthListItemRef={monthListItemRef}
          headerRef={headerRef}
          modal={isModal}
          setMountedSettings={setMountedSettings}
          skipAnimation={skipAnimation}
        />
      ) : showMonthSettings ? (
        <div className={monthSettingsPlaceholder}></div>
      ) : null}
      <AnimateDays
        daysWrapperRef={daysWrapperRef}
        duration={370}
        month={month}
        year={year}
        email={email}
        mountedSettings={mountedSettings}
      >
        {days}
      </AnimateDays>
      <div className={isModalClass} ref={isModalElementRef}></div>
    </>
  );
};

export const MonthSettings = ({
  setShowMonthSettings,
  showMonthSettings,
  mouseDownHandlerRef,
  handleAnimationEnd,
  closeLastOpenedModalRef,
  showMonthSettingsRef,
  monthListItemRef,
  overlayRef,
  modal,
  skipAnimation,
  headerRef,
  setMountedSettings,
}: IProps) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    closeLastOpenedModalRef.current = [
      ...closeLastOpenedModalRef.current,
      () => setShowMonthSettings(false),
    ];
    return () => {
      closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
        0,
        -1,
      );
    };
  }, [closeLastOpenedModalRef, setShowMonthSettings]);

  const monthSettings = useAppSelector((state) => state.main.monthSettings);

  useEffect(() => {
    if (monthSettings.data) {
      const { hourlyRate, overtimeMultiplier, weekdays } = monthSettings.data;
      dispatch(
        monthSettingsChanged({
          weekdays,
          hourlyRate,
          overtimeMultiplier,
        }),
      );
    }
  }, [dispatch, monthSettings]);

  const loaded = monthSettings.isSuccess && monthSettings.data;

  const hourlyRateInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    setMountedSettings(showMonthSettings ? true : false);
  }, [setMountedSettings, showMonthSettings]);

  const onSubmitRef = useRef((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });

  const onAnimationEnd = useCallback(() => {
    document.body.style.overflow = "";
    if (hourlyRateInputRef.current && showMonthSettingsRef.current) {
      hourlyRateInputRef.current.focus();
    }
    handleAnimationEnd();
  }, [handleAnimationEnd, showMonthSettingsRef]);

  const handleTabAfterWhitespaceClickRef = useRef((event: KeyboardEvent) => {
    if (
      document.activeElement === document.body &&
      priorityFocusedElementRef.current &&
      event.key === "Tab"
    ) {
      priorityFocusedElementRef.current.focus();
      event.preventDefault();
      priorityFocusedElementRef.current = undefined;
    }
  });

  useEffect(() => {
    const handleTabAfterWhitespaceClick =
      handleTabAfterWhitespaceClickRef.current;
    window.document.body.style.overflowY = "hidden";
    window.document.body.addEventListener(
      "keydown",
      handleTabAfterWhitespaceClick,
    );

    return () => {
      window.document.body.style.overflowY = "auto";
      window.document.body.removeEventListener(
        "keydown",
        handleTabAfterWhitespaceClick,
      );
    };
  }, []);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseButtonShiftTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && event.shiftKey && modal) {
        event.preventDefault();
        submitButtonRef.current?.focus();
      }
    },
  );

  const handleSubmitButtonTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey && modal) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    },
  );

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const onMouseDownRef = useRef((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget)
      priorityFocusedElementRef.current = closeButtonRef.current;
  });

  useEffect(() => {
    const focusedElementAtMount = document.activeElement;
    if (modal) hourlyRateInputRef.current?.focus();
    return () => {
      if (focusedElementAtMount instanceof HTMLElement)
        focusedElementAtMount.focus();
    };
  }, [modal]);

  return (
    <li
      onAnimationEnd={onAnimationEnd}
      className={`${monthSettingsComponent} 
      ${!skipAnimation ? (showMonthSettings ? mounted : unmounted) : ""} ${
        modal ? modalClass : ""
      }`}
      ref={monthListItemRef}
      data-month-settings={true}
      role="presentation"
      onMouseDown={mouseDownHandlerRef.current}
    >
      <aside role="presentation" className={monthSettingsFormWrapper}>
        {loaded ? (
          <form
            ref={overlayRef}
            className={monthSettingsContainer}
            onSubmit={onSubmitRef.current}
          >
            <MonthSettingsHeader
              closeButtonRef={closeButtonRef}
              onMouseDown={onMouseDownRef.current}
              onKeyDown={handleCloseButtonShiftTabRef.current}
              headerRef={headerRef}
              setShowMonthSettings={setShowMonthSettings}
            />
            <MonthSettingsScrollableArea
              hourlyRateInputRef={hourlyRateInputRef}
            />
            <MonthSettingsFooter
              setShowMonthSettings={setShowMonthSettings}
              submitButtonRef={submitButtonRef}
              onKeyDown={handleSubmitButtonTabRef.current}
            />
          </form>
        ) : (
          <div>Loading...</div>
        )}
      </aside>
    </li>
  );
};
