/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect, useRef, MouseEvent, FormEvent } from "react";
import { blackOverlay } from "../../sharedStyles.module.css";
import {
  applicationSettingsChanged,
  applicationSettingsLanguageChanged,
} from "../../slices/applicationSettingsSlice";
import { useAppDispatch, useAppSelector } from "../../store";

import {
  onboardingSettingsContainer,
  onboardingSettingsHeader,
  onboardingSettingsDialog,
} from "./OnboardingSettings.module.css";
import { OnboardingSettingsScrollableArea } from "./OnboardingSettingsScrollableArea/OnboardingSettingsScrollableArea";

interface IProps {
  setShowOnboardingSettings: React.Dispatch<React.SetStateAction<boolean>>;
}

export const OnboardingSettings = ({ setShowOnboardingSettings }: IProps) => {
  const dispatch = useAppDispatch();

  const languageCode = useAppSelector((state) => state.main.languageCode);
  const displayedCurrency = useAppSelector(
    (state) => state.main.displayedCurrency,
  );
  const applicationSettings = useAppSelector(
    (state) => state.main.applicationSettings,
  );

  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );

  //Set initial state
  const applicationSettingsData = applicationSettings.data;
  const displayedCurrencyData = displayedCurrency.data;

  useEffect(() => {
    if (applicationSettingsData && displayedCurrencyData !== undefined) {
      dispatch(
        applicationSettingsChanged({
          ...applicationSettingsData,
          displayedCurrency: displayedCurrencyData,
        }),
      );
    }
  }, [dispatch, applicationSettingsData, displayedCurrencyData]);

  useEffect(() => {
    dispatch(applicationSettingsLanguageChanged(languageCode));
  }, [dispatch, languageCode]);

  const loaded =
    applicationSettingsData &&
    applicationSettings.isSuccess &&
    displayedCurrencyData !== undefined &&
    displayedCurrency.isSuccess &&
    languageObject.data;

  const onboardingSettingsContainerRef = useRef<HTMLFormElement>(null);
  const languageSelectorBarRef = useRef<HTMLDivElement>(null);
  const languagesListRef = useRef<HTMLOListElement>(null);

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const scrollableAreaRef = useRef<HTMLDivElement>(null);

  const onMouseDownRef = useRef((event: MouseEvent<HTMLFormElement>) => {
    if (
      event.target === event.currentTarget ||
      event.target === scrollableAreaRef.current
    )
      priorityFocusedElementRef.current = languageSelectorBarRef.current;
  });

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

  const headingMouseDownHandlerRef = useRef(() => {
    priorityFocusedElementRef.current = languageSelectorBarRef.current;
  });

  const onSubmitRef = useRef((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });

  return (
    <dialog
      open={true}
      aria-modal="true"
      aria-labelledby="onboardingSettingsTitle"
      aria-describedby="Set onboarding settings."
      className={`${blackOverlay} ${onboardingSettingsDialog}`}
    >
      <form
        onSubmit={onSubmitRef.current}
        className={onboardingSettingsContainer}
        ref={onboardingSettingsContainerRef}
        onMouseDown={onMouseDownRef.current}
      >
        <h1
          className={onboardingSettingsHeader}
          id="onboardingSettingsTitle"
          onMouseDown={headingMouseDownHandlerRef.current}
        >
          Onboarding settings
        </h1>
        {loaded ? (
          <OnboardingSettingsScrollableArea
            setShowOnboardingSettings={setShowOnboardingSettings}
            scrollableAreaRef={scrollableAreaRef}
            onboardingSettingsContainerRef={onboardingSettingsContainerRef}
            languageSelectorBarRef={languageSelectorBarRef}
            languagesListRef={languagesListRef}
          />
        ) : (
          <div>Loading...</div>
        )}
      </form>
    </dialog>
  );
};
