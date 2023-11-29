import { useCallback, useEffect, useRef, useState } from "react";
import { getUserDetails } from "../../functions/getUserDetails";
import { useCloseOverlay } from "../../hooks/useCloseOverlay";
import { languageChanged } from "../../slices/mainSlice/mainSlice";
import { store, useAppDispatch, useAppSelector } from "../../store";
import { getLocalStorageItem } from "../../utils/typedLocalStorage/typedLocalStorage";
import { ApplicationSettings } from "../ApplicationSettings/ApplicationSettings";
import { Menu } from "../Menu/Menu";
import { MobileFloatingMenu } from "../MobileFloatingMenu/MobileFloatingMenu";
import { Month } from "../Month/Month";
import { OnboardingSettings } from "../OnboardingSettings/OnboardingSettings";
import { Authentication } from "../Authentication/Authentication";
import "./App.module.css";
import { Autosave } from "./Autosave";
import { saveDatesInLongTermStorage } from "../../functions/saveDatesInLongTermStorage";
import { SubscribeToApi } from "../SubscribeToApi/SubscribeToApi";
import { useStateRef } from "../../hooks/useStateRef";
import { Test } from "./Test";
import { Impex } from "../Impex/Impex";

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

const saveDates = () => {
  const { dates } = store.getState().main;
  if (dates.data) saveDatesInLongTermStorage(dates.data, true);
};

export const App = () => {
  const email = useAppSelector((state) => state.main.email);
  const languageCode = useAppSelector((state) => state.main.languageCode.data);

  const [guestShowOnboardingSettings, setGuestShowOnboardingSettings] =
    useState(false);

  // const [showImpex, setShowImpex] = useState(false);

  // const [userShowOnboardingSettings, setUserShowOnboardingSettings] =
  //   useState(false);

  const [
    showAuthenticationModal,
    setShowAuthenticationModal,
    showAuthenticationModalRef,
  ] = useStateRef<"register" | "login" | false>(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);

  const prevScrollAmount = useRef(0);

  const showOnboardingSettings =
    email !== undefined ? guestShowOnboardingSettings : false;

  const setShowOnboardingSettings = setGuestShowOnboardingSettings;

  const handleWindowScroll = () => {
    if (Math.abs(prevScrollAmount.current - window.scrollY) > 50) {
      if (prevScrollAmount.current > window.scrollY) {
        setShowFloatingMenu(true);
      } else {
        setShowFloatingMenu(false);
      }
      prevScrollAmount.current = window.scrollY;
    }
  };

  const apiURL = `https://${import.meta.env.VITE_SERVER_URL}`;

  const getOnboardingStatusRef = useRef(async () => {
    const result = await fetch(`${apiURL}/onboardingstatus`, {
      headers: { "Content-Type": "application/json" },
      method: "post",
      credentials: "include",
    });
    const parsedResult = await result.json();
    setGuestShowOnboardingSettings(!parsedResult);
  });

  useEffect(() => {
    const getOnboardingStatus = getOnboardingStatusRef.current;
    if (email) {
      getOnboardingStatus();
    } else {
      const localStorageApplicationSettings = getLocalStorageItem(
        "applicationSettings",
      );
      setGuestShowOnboardingSettings(!localStorageApplicationSettings);
    }
  }, [email]);

  useEffect(() => {
    window.addEventListener("scroll", handleWindowScroll);
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(languageChanged(languageCode));
    return () => {
      promise.abort();
    };
  }, [dispatch, languageCode]);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const closeLastOpenedModalRef = useRef<(typeof noop)[]>([]);

  const handleKeyDownRef = useRef((event: KeyboardEvent) => {
    if (event.key === "Escape")
      (closeLastOpenedModalRef.current.at(-1) ?? noop)();
    else if (event.code === "KeyS" && event.ctrlKey) {
      event.preventDefault();
      saveDates();
    }
  });

  useEffect(() => {
    const handleKeyDown = handleKeyDownRef.current;
    window.document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDownRef]);

  useEffect(() => {
    getUserDetails();
  }, []);

  const {
    mouseDownHandlerRef,
    showOverlay: showMonthSettings,
    showOverlayRef: showMonthSettingsRef,
    setShowOverlay: setShowMonthSettings,
    overlayRef: monthSettingsContainerRef,
  } = useCloseOverlay<HTMLFormElement>();

  const {
    mouseDownHandlerRef: handleImpexBackdropMouseDownRef,
    showOverlay: showImpex,
    setShowOverlay: setShowImpex,
  } = useCloseOverlay<HTMLDialogElement>(false);

  const {
    mouseDownHandlerRef: handleBlackOverlayMouseDownRef,
    showOverlay: showApplicationSettings,
    setShowOverlay: setShowApplicationSettings,
    overlayRef: applicationSettingsContainerRef,
  } = useCloseOverlay<HTMLFormElement>();

  return (
    <>
      <Menu
        setShowApplicationSettings={setShowApplicationSettings}
        setShowMonthSettings={setShowMonthSettings}
        setShowAuthenticationModal={setShowAuthenticationModal}
        setShowImpex={setShowImpex}
        closeLastOpenedModalRef={closeLastOpenedModalRef}
      />
      <Month
        closeLastOpenedModalRef={closeLastOpenedModalRef}
        showMonthSettings={showMonthSettings}
        showMonthSettingsRef={showMonthSettingsRef}
        setShowMonthSettings={setShowMonthSettings}
        mouseDownHandlerRef={mouseDownHandlerRef}
        overlayRef={monthSettingsContainerRef}
      />
      <MobileFloatingMenu
        showOptions={showFloatingMenu}
        setShowImpex={setShowImpex}
      />
      {showApplicationSettings ? (
        <ApplicationSettings
          closeLastOpenedModalRef={closeLastOpenedModalRef}
          setShowApplicationSettings={setShowApplicationSettings}
          handleBlackOverlayMouseDownRef={handleBlackOverlayMouseDownRef}
          applicationSettingsContainerRef={applicationSettingsContainerRef}
        />
      ) : null}
      {showOnboardingSettings ? (
        <OnboardingSettings
          setShowOnboardingSettings={setShowOnboardingSettings}
        />
      ) : null}
      {showImpex ? (
        <Impex
          handleImpexBackdropMouseDownRef={handleImpexBackdropMouseDownRef}
          setShowImpex={setShowImpex}
          closeLastOpenedModalRef={closeLastOpenedModalRef}
        />
      ) : null}
      {showAuthenticationModal ? (
        <Authentication
          closeLastOpenedModalRef={closeLastOpenedModalRef}
          showAuthenticationModal={showAuthenticationModal}
          showAuthenticationModalRef={showAuthenticationModalRef}
          setShowAuthenticationModal={setShowAuthenticationModal}
        />
      ) : null}
      <Autosave />
      <SubscribeToApi />
      <div id="notifications"></div>
    </>
  );
};
