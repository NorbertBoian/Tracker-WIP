/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import {
  MouseEvent,
  useEffect,
  useRef,
  useState,
  FormEvent,
  FocusEvent,
  useLayoutEffect,
  createRef,
} from "react";
import { blackOverlay } from "../../sharedStyles.module.css";

import { useAppDispatch, useAppSelector } from "../../store";

import {
  applicationSettingsContainer,
  applicationSettingsDialog,
  mobile,
  isMobile,
} from "./ApplicationSettings.module.css";
import { ApplicationSettingsFooter } from "./ApplicationSettingsFooter/ApplicationSettingsFooter";
import { ApplicationSettingsHeader } from "./ApplicationSettingsHeader/ApplicationSettingsHeader";
import { ApplicationSettingsScrollableArea } from "./ApplicationSettingsScrollableArea/ApplicationSettingsScrollableArea";

import {
  applicationSettingsChanged,
  applicationSettingsLanguageChanged,
} from "../../slices/applicationSettingsSlice";
import { useStateRef } from "../../hooks/useStateRef";

interface IProps {
  setShowApplicationSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
  applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>;
  handleBlackOverlayMouseDownRef: React.MutableRefObject<
    (event: MouseEvent) => void
  >;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
}

const menuOptions = ["general", "colors", "days"] as const;

const initialReportValidity = [] as const;

export const ApplicationSettings = ({
  setShowApplicationSettings,
  applicationSettingsContainerRef,
  closeLastOpenedModalRef,
  handleBlackOverlayMouseDownRef,
}: IProps) => {
  const headerRef = useRef<null | HTMLDivElement>(null);
  const footerRef = useRef<null | HTMLDivElement>(null);

  const [selectedMobileMenu, setSelectedMobileMenu] = useState<
    "general" | "colors" | "days"
  >("general");

  const [reportValidity, setReportValidity] = useState<unknown[] | readonly []>(
    initialReportValidity,
  );

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const handleMobileMenuButtonClickRef = useRef(
    (event: MouseEvent<HTMLButtonElement>) => {
      const mobileMenuDataAttribute = event.currentTarget.dataset.mobileMenu;
      if (
        mobileMenuDataAttribute === menuOptions[0] ||
        mobileMenuDataAttribute === menuOptions[1] ||
        mobileMenuDataAttribute === menuOptions[2]
      ) {
        setSelectedMobileMenu(mobileMenuDataAttribute);
        lastMenuInteractedWithRef.current = mobileMenuDataAttribute;
      }
    },
  );

  const generalTabRef = useRef<null | HTMLButtonElement>(null);
  const daysTabRef = useRef<null | HTMLButtonElement>(null);
  const colorsTabRef = useRef<null | HTMLButtonElement>(null);
  const closeButtonRef = useRef<null | HTMLButtonElement>(null);
  const saveButtonRef = useRef<null | HTMLButtonElement>(null);
  const languageSelectorBarRef = useRef<null | HTMLDivElement>(null);

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

  const [usingMobileLayout, setUsingMobileLayout, usingMobileLayoutRef] =
    useStateRef<undefined | boolean>(undefined);

  useLayoutEffect(() => {
    setUsingMobileLayout(!!isMobileElementRef.current?.offsetWidth);
  }, [setUsingMobileLayout]);

  const isMobileElementRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      setUsingMobileLayout(!!entries[0].contentRect.width);
    });
    const isMobileElement = isMobileElementRef.current;
    if (isMobileElement) {
      resizeObserver.observe(isMobileElement);
      return () => {
        resizeObserver.unobserve(isMobileElement);
      };
    }
    setUsingMobileLayout(!!generalTabRef.current?.offsetHeight);
  }, [setUsingMobileLayout]);

  useLayoutEffect(() => {
    const focusedElementAtMount = document.activeElement;
    if (!usingMobileLayoutRef.current && languageSelectorBarRef.current) {
      languageSelectorBarRef.current.focus();
    }
    return () => {
      if (focusedElementAtMount instanceof HTMLElement)
        focusedElementAtMount.focus();
    };
  }, [usingMobileLayoutRef]);

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

  const dispatch = useAppDispatch();

  const languageCode = useAppSelector((state) => state.main.languageCode);
  const autosaveInterval = useAppSelector(
    (state) => state.main.autosaveInterval,
  );
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
  const autosaveIntervalData = autosaveInterval.data;

  useEffect(() => {
    if (
      applicationSettingsData &&
      displayedCurrencyData &&
      autosaveIntervalData
    ) {
      dispatch(
        applicationSettingsChanged({
          ...applicationSettingsData,
          displayedCurrency: displayedCurrencyData,
          autosaveInterval: autosaveIntervalData,
        }),
      );
    }
  }, [
    dispatch,
    applicationSettingsData,
    displayedCurrencyData,
    autosaveIntervalData,
  ]);

  useEffect(() => {
    dispatch(applicationSettingsLanguageChanged(languageCode));
  }, [dispatch, languageCode]);

  useEffect(() => {
    closeLastOpenedModalRef.current = [
      ...closeLastOpenedModalRef.current,
      () => setShowApplicationSettings(false),
    ];
    return () => {
      closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
        0,
        -1,
      );
    };
  }, [closeLastOpenedModalRef, setShowApplicationSettings]);

  const loaded =
    applicationSettingsData &&
    applicationSettings.isSuccess &&
    displayedCurrencyData !== undefined &&
    displayedCurrency.isSuccess;
  autosaveIntervalData !== undefined &&
    autosaveInterval.isSuccess &&
    usingMobileLayout !== undefined &&
    languageObject.data;

  const onSubmitRef = useRef((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });

  useEffect(() => {
    if (
      reportValidity !== initialReportValidity &&
      applicationSettingsContainerRef.current
    ) {
      const hiddenElements = [
        ...applicationSettingsContainerRef.current.elements,
      ].filter((element) =>
        element instanceof HTMLElement ? element.offsetHeight === 0 : false,
      );
      const disabledStates: boolean[] = [];
      hiddenElements.forEach((element, index) => {
        if ("disabled" in element && typeof element.disabled === "boolean") {
          disabledStates[index] = element.disabled;
          element.disabled = "true";
        }
      });
      applicationSettingsContainerRef.current?.reportValidity();
      disabledStates.forEach((disabled, index) => {
        const element = hiddenElements[index];
        if (disabled !== undefined && "disabled" in element)
          element.disabled = disabled;
      });
    }
  }, [applicationSettingsContainerRef, reportValidity]);

  const applicationDaySettingsBarsRefsRef = useRef(
    Array.from({ length: 7 }, () => createRef<HTMLFieldSetElement>()),
  );

  const defaultColorButtonsRefsRef = useRef(
    Array.from({ length: 7 }, () => createRef<HTMLButtonElement>()),
  );

  const colorPickersRefsRef = useRef(
    Array.from({ length: 7 }, () => createRef<HTMLDivElement>()),
  );

  const dayPreviewRef = useRef<HTMLDivElement>(null);
  const autosaveSectionRef = useRef<HTMLFieldSetElement>(null);
  const explanationsSectionRef = useRef<HTMLDivElement>(null);
  const preferredLanguageDescriptionRef = useRef<HTMLDivElement>(null);
  const languagesListRef = useRef<HTMLOListElement>(null);
  const threeInputsFieldSetRef = useRef<HTMLFieldSetElement>(null);

  const colorMenuRefs = useRef([
    ...colorPickersRefsRef.current,
    ...colorPickersRefsRef.current,
    ...defaultColorButtonsRefsRef.current,
    dayPreviewRef,
  ]);
  const daysMenuRefs = useRef([
    ...applicationDaySettingsBarsRefsRef.current,
    explanationsSectionRef,
  ]);

  const lastMenuInteractedWithRef = useRef<"general" | "colors" | "days">(
    selectedMobileMenu,
  );

  const getElementMobileMenuMembershipRef = useRef((element: HTMLElement) => {
    const elementIsDescendantOfColorMenu = colorMenuRefs.current.some(
      (colorMenuElementRef) => colorMenuElementRef.current?.contains(element),
    );
    if (elementIsDescendantOfColorMenu) return "colors";
    const elementIsDescendantOfDaysMenu = daysMenuRefs.current.some(
      (daysMenuElementRef) => daysMenuElementRef.current?.contains(element),
    );
    if (elementIsDescendantOfDaysMenu) return "days";
    return "general";
  });

  const onMouseDownRef = useRef((event: MouseEvent<HTMLFormElement>) => {
    if (event.target instanceof HTMLElement && !(event.target.tabIndex > -1)) {
      lastMenuInteractedWithRef.current =
        getElementMobileMenuMembershipRef.current(event.target);
    } else if (event.target === event.currentTarget)
      priorityFocusedElementRef.current = closeButtonRef.current; //handleFormWhitespaceMouseDown
  });

  const onFocusRef = useRef((event: FocusEvent<HTMLFormElement>) => {
    if (event.target instanceof HTMLElement) {
      lastMenuInteractedWithRef.current =
        getElementMobileMenuMembershipRef.current(event.target);
    }
  });

  useLayoutEffect(() => {
    if (usingMobileLayout) {
      setSelectedMobileMenu(lastMenuInteractedWithRef.current);
    } else {
      setSelectedMobileMenu("general");
    }
  }, [usingMobileLayout]);

  return (
    <dialog
      open={true}
      aria-modal="true"
      aria-labelledby="applicationSettingsTitle"
      aria-describedby="Set application settings."
      onMouseDown={handleBlackOverlayMouseDownRef.current}
      className={`${blackOverlay} ${applicationSettingsDialog}`}
    >
      <div className={isMobile} ref={isMobileElementRef}></div>
      <form
        onMouseDown={onMouseDownRef.current}
        onSubmit={onSubmitRef.current}
        onFocus={onFocusRef.current}
        ref={applicationSettingsContainerRef}
        className={`${applicationSettingsContainer} ${
          usingMobileLayout ? mobile : ""
        }`}
      >
        {loaded ? (
          <>
            <ApplicationSettingsHeader
              priorityFocusedElementRef={priorityFocusedElementRef}
              headerRef={headerRef}
              handleMobileMenuButtonClickRef={handleMobileMenuButtonClickRef}
              generalTabRef={generalTabRef}
              daysTabRef={daysTabRef}
              colorsTabRef={colorsTabRef}
              closeButtonRef={closeButtonRef}
              saveButtonRef={saveButtonRef}
              selectedMobileMenu={selectedMobileMenu}
              setShowApplicationSettings={setShowApplicationSettings}
            />
            <ApplicationSettingsScrollableArea
              usingMobileLayout={!!usingMobileLayout}
              usingMobileLayoutRef={usingMobileLayoutRef}
              closeLastOpenedModalRef={closeLastOpenedModalRef}
              languageSelectorBarRef={languageSelectorBarRef}
              applicationSettingsContainerRef={applicationSettingsContainerRef}
              footerRef={footerRef}
              headerRef={headerRef}
              selectedMobileMenu={selectedMobileMenu}
              applicationDaySettingsBarsRefsRef={
                applicationDaySettingsBarsRefsRef
              }
              dayPreviewRef={dayPreviewRef}
              autosaveSectionRef={autosaveSectionRef}
              explanationsSectionRef={explanationsSectionRef}
              defaultColorButtonsRefsRef={defaultColorButtonsRefsRef}
              colorPickersRefsRef={colorPickersRefsRef}
              preferredLanguageDescriptionRef={preferredLanguageDescriptionRef}
              languagesListRef={languagesListRef}
              threeInputsFieldSetRef={threeInputsFieldSetRef}
            />

            <ApplicationSettingsFooter
              footerRef={footerRef}
              applicationSettingsContainerRef={applicationSettingsContainerRef}
              setReportValidity={setReportValidity}
              setSelectedMobileMenu={setSelectedMobileMenu}
              saveButtonRef={saveButtonRef}
              closeButtonRef={closeButtonRef}
              setShowApplicationSettings={setShowApplicationSettings}
            />
          </>
        ) : (
          <div>Loading...</div>
        )}
      </form>
    </dialog>
  );
};
