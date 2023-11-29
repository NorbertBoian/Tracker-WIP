import {
  registerButton,
  logInButton,
  userButton,
} from "./LeftSideMenu.module.css";

import settingsIcon from "./assets/settingsIcon.svg";
import { defaultButton } from "../../../sharedStyles.module.css";
import { useAppSelector } from "../../../store";
import { useRef, KeyboardEvent } from "react";

interface IProps {
  loggedIn: boolean;
  username: false | string;
  setShowApplicationSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
  setShowAuthenticationModal: React.Dispatch<
    React.SetStateAction<false | "register" | "login">
  >;
}

export const LeftSideMenu = ({
  loggedIn,
  username,
  setShowApplicationSettings,
  setShowAuthenticationModal,
}: IProps) => {
  const handleUserButtonClickRef = useRef(() =>
    setShowApplicationSettings(true),
  );

  const onKeyDownRef = useRef((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      handleUserButtonClickRef.current();
    }
  });

  const { register, logIn, guest, applicationSettings } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const handleRegisterRef = useRef(() => {
    setShowAuthenticationModal("register");
  });

  const handleLogInRef = useRef(() => {
    setShowAuthenticationModal("login");
  });

  return (
    <>
      {!loggedIn ? (
        <>
          <button
            type="button"
            onClick={handleRegisterRef.current}
            className={`${defaultButton} ${registerButton}`}
          >
            {register}
          </button>
          <button
            type="button"
            onClick={handleLogInRef.current}
            className={`${defaultButton} ${logInButton}`}
          >
            {logIn}
          </button>
        </>
      ) : null}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDownRef.current}
        aria-label={applicationSettings}
        onClick={handleUserButtonClickRef.current}
        className={`${defaultButton} ${userButton}`}
      >
        <img src={settingsIcon} alt="" />
        {username ? username : guest}
      </div>
    </>
  );
};
