import {
  useEffect,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
  FormEvent,
  ChangeEvent,
  useRef,
  MouseEvent,
} from "react";
import { getCreateNotification } from "../../functions/createNotification/createNotification";
import { getUserDetails } from "../../functions/getUserDetails";
import { useFocusOutline } from "../../hooks/useFocusOutline";
import { useStateRef } from "../../hooks/useStateRef";
import {
  blackOverlay,
  defaultButton,
  defaultInput,
} from "../../sharedStyles.module.css";
import { apiSlice } from "../../slices/apiSlice";

import { store } from "../../store";
import {
  registeModalContainer,
  closeButton,
  scrollableArea,
  inputName,
  invalid,
  inputTitleContainer,
  invalidInputWarningText,
  inputField,
  passwordRequirements,
  logInInstead,
  header,
  inputsSection,
  registerButton,
  focusOutline,
} from "./Authentication.module.css";

const apiURL = `https://${import.meta.env.VITE_SERVER_URL}`;

const logOutUser = () =>
  fetch(`${apiURL}/logout`, {
    method: "delete",
    credentials: "include",
  });

export const onLogOut = async () => {
  await logOutUser();
  getUserDetails();
};

const { dispatch } = store;

const onLogIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  await onLogOut();
  const logInResponse = await dispatch(
    apiSlice.endpoints.logInUser.initiate({ email, password }),
  );
  getUserDetails();
  return logInResponse;
};

const registerUser = ({
  username,
  password,
  email,
}: {
  username: string;
  email: string;
  password: string;
}) =>
  fetch(`${apiURL}/register`, {
    headers: { "Content-Type": "application/json" },
    method: "post",
    body: JSON.stringify({ username, password, email }),
    credentials: "include",
  });

const onRegister = async ({
  username,
  password,
  email,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const registerResponse = await registerUser({ username, password, email });
  if (registerResponse.ok) return await onLogIn({ email, password });
};

interface IProps {
  showAuthenticationModal: false | "register" | "login";
  setShowAuthenticationModal: React.Dispatch<
    React.SetStateAction<false | "register" | "login">
  >;
  showAuthenticationModalRef: React.MutableRefObject<
    false | "register" | "login"
  >;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
}

const createCouldntAuthenticateNotification = getCreateNotification(
  "Couldn't authenticate.",
);

export const Authentication = ({
  closeLastOpenedModalRef,
  showAuthenticationModal,
  showAuthenticationModalRef,
  setShowAuthenticationModal,
}: IProps) => {
  const handleInsteadRef = useRef(() => {
    setShowAuthenticationModal((showAuthenticationModal) =>
      showAuthenticationModal === "register" ? "login" : "register",
    );
  });

  const handleCloseRef = useRef(() => {
    setShowAuthenticationModal(false);
  });

  const [username, setUsername, usernameRef] = useStateRef("");
  const [password, setPassword, passwordRef] = useStateRef("");
  const [email, setEmail, emailRef] = useStateRef("");

  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const passwordInputRef = useRef<HTMLInputElement | null>(null);
  const usernameInputRef = useRef<HTMLInputElement | null>(null);

  const [emailValidity, setEmailValidity] = useState<boolean | undefined>(
    undefined,
  );
  const [passwordValidity, setPasswordValidity] = useState<boolean | undefined>(
    undefined,
  );
  const [usernameValidity, setUsernameValidity] = useState<boolean | undefined>(
    undefined,
  );

  const handleUserInputChangeRef = useRef(
    (event: ChangeEvent<HTMLInputElement>) => {
      setUsername(event.currentTarget.value);
    },
  );

  useEffect(() => {
    setUsernameValidity((usernameValidity) =>
      usernameValidity === false
        ? usernameInputRef.current?.validity.valid
        : usernameValidity,
    );
  }, [username]);

  const handleEmailInputChangeRef = useRef(
    (event: ChangeEvent<HTMLInputElement>) => {
      setEmail(event.currentTarget.value);
    },
  );

  useEffect(() => {
    setEmailValidity((emailValidity) =>
      emailValidity === false
        ? emailInputRef.current?.validity.valid
        : emailValidity,
    );
  }, [email]);

  const handlePasswordInputChangeRef = useRef(
    (event: ChangeEvent<HTMLInputElement>) => {
      setPassword(event.currentTarget.value);
    },
  );

  useEffect(() => {
    setPasswordValidity((passwordValidity) =>
      passwordValidity === false
        ? passwordInputRef.current?.validity.valid
        : passwordValidity,
    );
  }, [password]);

  const authenticationFormRef = useRef<HTMLFormElement>(null);

  const handleAutheticationRef = useRef(async () => {
    if (usernameInputRef.current)
      setUsernameValidity(usernameInputRef.current?.validity.valid);
    setEmailValidity(emailInputRef.current?.validity.valid);
    setPasswordValidity(passwordInputRef.current?.validity.valid);
    if (
      emailInputRef.current?.validity.valid &&
      passwordInputRef.current?.validity.valid
    ) {
      let response;
      const username = usernameRef.current;
      const password = passwordRef.current;
      const email = emailRef.current;
      if (showAuthenticationModalRef.current === "register") {
        if (usernameInputRef.current?.validity.valid)
          response = await onRegister({ username, password, email });
        else {
          authenticationFormRef.current?.reportValidity();
        }
      } else {
        response = await onLogIn({ password, email });
      }
      if (
        response &&
        !("error" in response) &&
        typeof response.data !== "string" &&
        response.data.loggedIn
      )
        setShowAuthenticationModal(false);
      else {
        createCouldntAuthenticateNotification();
      }
    } else {
      authenticationFormRef.current?.reportValidity();
    }
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

  useEffect(() => {
    closeLastOpenedModalRef.current = [
      ...closeLastOpenedModalRef.current,
      () => setShowAuthenticationModal(false),
    ];
    return () => {
      closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
        0,
        -1,
      );
    };
  }, [closeLastOpenedModalRef, setShowAuthenticationModal]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseButtonShiftTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        submitButtonRef.current?.focus();
      }
    },
  );

  const handleSubmitButtonTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    },
  );

  // useEffect(() => {
  //   const focusedElementAtMount = document.activeElement;
  //   return () => {
  //     if (focusedElementAtMount instanceof HTMLElement)
  //       focusedElementAtMount.focus();
  //   };
  // }, []);

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const scrollableAreaRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const onMouseDownRef = useRef((event: MouseEvent<HTMLFormElement>) => {
    if (
      event.target === event.currentTarget ||
      event.target === scrollableAreaRef.current ||
      event.target === headerRef.current
    )
      priorityFocusedElementRef.current = closeButtonRef.current;
  });

  const onSubmitRef = useRef((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  });

  const handleKeyDownRef = useRef((event: KeyboardEvent) => {
    if (
      event.key === "Enter" &&
      (!event.target ||
        event.target === document.body ||
        event.target instanceof HTMLInputElement)
    ) {
      handleAutheticationRef.current();
    }
  });

  useEffect(() => {
    const focusedElementAtMount = document.activeElement;
    if (showAuthenticationModalRef.current === "login") {
      emailInputRef.current?.focus();
    } else showAuthenticationModalRef.current === "register";
    {
      usernameInputRef.current?.focus();
    }
    return () => {
      if (focusedElementAtMount instanceof HTMLElement)
        focusedElementAtMount.focus();
    };
  }, [showAuthenticationModalRef]);

  useEffect(() => {
    if (showAuthenticationModal === "login") {
      emailInputRef.current?.focus();
    } else showAuthenticationModal === "register";
    {
      usernameInputRef.current?.focus();
    }
  }, [showAuthenticationModal]);

  useEffect(() => {
    const handleKeyDown = handleKeyDownRef.current;
    window.document.body.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const {
    onInputMouseDownRef: onUsernameInputMouseDownRef,
    onInputFocusRef: onUsernameInputFocusRef,
    onInputBlurRef: onUsernameInputBlurRef,
    inputisFocused: usernameInputisFocused,
  } = useFocusOutline();

  const {
    onInputMouseDownRef: onEmailInputMouseDownRef,
    onInputFocusRef: onEmailInputFocusRef,
    onInputBlurRef: onEmailInputBlurRef,
    inputisFocused: emailInputisFocused,
  } = useFocusOutline();

  const {
    onInputBlurRef: onPasswordInputBlurRef,
    onInputFocusRef: onPasswordInputFocusRef,
    onInputMouseDownRef: onPasswordInputMouseDownRef,
    inputisFocused: passwordInputisFocused,
  } = useFocusOutline();

  return (
    <>
      <div
        role="presentation"
        onMouseDown={handleCloseRef.current}
        className={blackOverlay}
      ></div>
      <form
        ref={authenticationFormRef}
        onSubmit={onSubmitRef.current}
        role="presentation"
        className={registeModalContainer}
        onMouseDown={onMouseDownRef.current}
      >
        <header className={header} ref={headerRef}>
          <h1>
            {showAuthenticationModal === "register"
              ? "Registration"
              : "Authentication"}
          </h1>
          <button
            ref={closeButtonRef}
            type="button"
            onKeyDown={handleCloseButtonShiftTabRef.current}
            onClick={handleCloseRef.current}
            className={`${defaultButton} ${closeButton}`}
          >
            Close
          </button>
        </header>
        <section className={scrollableArea} ref={scrollableAreaRef}>
          <fieldset className={inputsSection}>
            {showAuthenticationModal === "register" ? (
              <div className={usernameValidity === false ? invalid : ""}>
                <div className={`${inputTitleContainer}`}>
                  <label htmlFor="usernameInput" className={inputName}>
                    Displayed name
                  </label>
                  <div className={invalidInputWarningText}>
                    &nbsp;- Invalid display name
                  </div>
                </div>
                <input
                  onFocus={onUsernameInputFocusRef.current}
                  onBlur={onUsernameInputBlurRef.current}
                  onMouseDown={onUsernameInputMouseDownRef.current}
                  id="usernameInput"
                  aria-label={
                    usernameValidity ? "Displayed name" : "Invalid display name"
                  }
                  autoComplete="username"
                  minLength={1}
                  required={true}
                  maxLength={8}
                  value={username}
                  ref={usernameInputRef}
                  onChange={handleUserInputChangeRef.current}
                  className={`${defaultInput} ${inputField} ${
                    usernameInputisFocused ? focusOutline : ""
                  }`}
                />
              </div>
            ) : null}
            <div className={emailValidity === false ? invalid : ""}>
              <div
                className={`${inputTitleContainer} ${
                  emailValidity === false ? invalid : ""
                }`}
              >
                <label htmlFor="emailInput" className={inputName}>
                  Email
                </label>
                <div className={invalidInputWarningText}>
                  &nbsp;- Invalid email
                </div>
              </div>
              <input
                onFocus={onEmailInputFocusRef.current}
                onBlur={onEmailInputBlurRef.current}
                onMouseDown={onEmailInputMouseDownRef.current}
                id="emailInput"
                autoComplete="email"
                aria-label={emailValidity ? "Email" : "Invalid email"}
                onChange={handleEmailInputChangeRef.current}
                required={true}
                value={email}
                ref={emailInputRef}
                type="email"
                className={`${defaultInput} ${inputField} ${
                  emailInputisFocused ? focusOutline : ""
                }`}
              />
            </div>
            <div className={passwordValidity === false ? invalid : ""}>
              <div
                className={`${inputTitleContainer} ${
                  passwordValidity === false ? invalid : ""
                }`}
              >
                <label htmlFor="passwordInput" className={inputName}>
                  Password
                </label>
                <div className={invalidInputWarningText}>
                  &nbsp;- Password is too short
                </div>
              </div>
              <input
                onFocus={onPasswordInputFocusRef.current}
                onBlur={onPasswordInputBlurRef.current}
                onMouseDown={onPasswordInputMouseDownRef.current}
                id="passwordInput"
                value={password}
                aria-label={
                  passwordValidity ? "Password" : "Password is too short"
                }
                autoComplete={
                  showAuthenticationModal === "register"
                    ? "new-password"
                    : "current-password"
                }
                onChange={handlePasswordInputChangeRef.current}
                minLength={8}
                required={true}
                ref={passwordInputRef}
                type="password"
                className={`${defaultInput} ${inputField} ${
                  passwordInputisFocused ? focusOutline : ""
                } `}
              />
            </div>
            <div className={passwordRequirements}>
              Password requirement: at least 8 characters long
            </div>
          </fieldset>
          <p className={logInInstead}>
            {showAuthenticationModal === "register"
              ? "Already have an account? "
              : "Do not have an account? "}
            <button onClick={handleInsteadRef.current} type="button">
              {showAuthenticationModal === "register" ? "Log in" : "Register"}
            </button>{" "}
            instead.
          </p>
        </section>

        <button
          type="button"
          onClick={handleAutheticationRef.current}
          onKeyDown={handleSubmitButtonTabRef.current}
          className={`${defaultButton} ${registerButton}`}
          ref={submitButtonRef}
        >
          {showAuthenticationModal === "register" ? "Register" : "Log In"}
        </button>
      </form>
    </>
  );
};
