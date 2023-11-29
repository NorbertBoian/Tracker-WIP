import { defaultButton } from "../../sharedStyles.module.css";
import signOutIcon from "./assets/signOutIcon.svg";
import { LanguagesDropdown } from "../Shared/LanguagesDropdown/LanguagesDropdown";
import { LeftSideMenu } from "./LeftSideMenu/LeftSideMenu";

import {
  menuComponent,
  flexBreak,
  guideButtonText,
  guideButton,
  guideButtonCircle,
  logOutButton,
  mobileGuide,
  logOutIcon,
  flexBreak2,
  loggedIn as loggedInClass,
  languagesDropdownContainer,
} from "./Menu.module.css";
import { MiddleMenu } from "./MiddleMenu/MiddleMenu";
import { RightSideMenu } from "./RightSideMenu/RightSideMenu";
import { useAppSelector } from "../../store";

import { onLogOut } from "../Authentication/Authentication";
import { MonthlyStats } from "./MonthlyStats/MonthlyStats";
import {
  createPrompt,
  getCreatePrompt,
} from "../../functions/createPrompt/createPrompt";
import { setLanguage } from "../../functions/setLanguage";
import { useCallback, useEffect, useRef } from "react";
import { getRateLimitedFunction } from "../../functions/getRateLimitedFunction";

interface IProps {
  setShowApplicationSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
  setShowMonthSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
  setShowAuthenticationModal: React.Dispatch<
    React.SetStateAction<false | "register" | "login">
  >;
  setShowImpex: React.Dispatch<React.SetStateAction<boolean | 2>>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
}

export const Menu = ({
  setShowApplicationSettings,
  setShowMonthSettings,
  setShowAuthenticationModal,
  setShowImpex,
  closeLastOpenedModalRef,
}: IProps) => {
  const { guide } = useAppSelector((state) => state.main.languageObject.data);

  const languageCode = useAppSelector((state) => state.main.languageCode);
  const username = useAppSelector((state) => state.main.username);
  const email = useAppSelector((state) => state.main.email);

  const isLoggedIn = !!email;

  const toolbarRef = useRef<HTMLDivElement>(null);

  const reorderDomRef = useRef(() => {
    const toolbarElement = toolbarRef.current;
    if (toolbarElement) {
      const children = [...toolbarRef.current.children].filter(
        (child) => getComputedStyle(child).display !== "none",
      );
      const orderedChildren = [...children].sort(
        (a, b) => +getComputedStyle(a).order - +getComputedStyle(b).order,
      );

      if (children.some((child, i) => child !== orderedChildren[i]))
        orderedChildren.forEach((child) => {
          toolbarElement.appendChild(child);
        });
    }
  });

  const handleResizeRef = useRef(() => reorderDomRef.current());

  const rateLimitedHandleResizeRef = useRef(
    getRateLimitedFunction(handleResizeRef.current, 1000),
  );

  useEffect(() => {
    const rateLimitedHandleResize = rateLimitedHandleResizeRef.current;
    window.addEventListener("resize", rateLimitedHandleResize);
    return () => {
      window.removeEventListener("resize", rateLimitedHandleResize);
    };
  }, []);

  useEffect(() => {
    reorderDomRef.current();
  }, [isLoggedIn]);

  const createLogOutPrompt = useCallback(
    () =>
      createPrompt(
        "Are you sure you want to log out?",
        onLogOut,
        closeLastOpenedModalRef,
      ),
    [closeLastOpenedModalRef],
  );

  return (
    <div
      ref={toolbarRef}
      role="toolbar"
      className={`${menuComponent} ${email ? loggedInClass : ""}`}
    >
      <button className={`${defaultButton} ${guideButton}`}>
        <div className={guideButtonCircle}></div>
        <div className={guideButtonText}>{guide}</div>
      </button>
      <LeftSideMenu
        username={username}
        loggedIn={isLoggedIn}
        setShowAuthenticationModal={setShowAuthenticationModal}
        setShowApplicationSettings={setShowApplicationSettings}
      />
      <MiddleMenu
        setShowMonthSettings={setShowMonthSettings}
        loggedIn={isLoggedIn}
        closeLastOpenedModalRef={closeLastOpenedModalRef}
      />
      <RightSideMenu loggedIn={isLoggedIn} setShowImpex={setShowImpex} />
      <div className={`${languagesDropdownContainer}`}>
        <LanguagesDropdown
          type="toolbar"
          selectedLanguage={languageCode.data ?? "en"}
          setLanguage={setLanguage}
        />
      </div>
      <button className={`${defaultButton} ${mobileGuide}`}>
        Check out the guide.
      </button>
      {isLoggedIn ? (
        <button
          onClick={createLogOutPrompt}
          className={`${defaultButton} ${logOutButton}`}
          title="Log out"
          // title={logOut}
        >
          <img src={signOutIcon} alt="" className={logOutIcon} />
        </button>
      ) : null}
      <hr className={flexBreak}></hr>
      <MonthlyStats loggedIn={isLoggedIn} />
      <hr className={flexBreak2}></hr>
    </div>
  );
};
