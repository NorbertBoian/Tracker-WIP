import ReactDOM from "react-dom/client";
import { defaultButton } from "../../sharedStyles.module.css";
import {
  promptContainer as promptContainerClass,
  blackOverlay,
  buttonsContainer,
  yes,
  no,
} from "./prompt.module.css";
import {
  useRef,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent,
  useEffect,
} from "react";

const noop = () => {};

const PromptComponent = ({
  closePrompt,
  handleCallback,
  text,
  closeLastOpenedModalRef,
}) => {
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
      closePrompt,
    ];
    return () => {
      closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
        0,
        -1,
      );
    };
  }, []);

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

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const onMouseDownRef = useRef((event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget)
      priorityFocusedElementRef.current = closeButtonRef.current;
  });

  useEffect(() => {
    const focusedElementAtMount = document.activeElement;
    submitButtonRef.current?.focus();
    return () => {
      if (focusedElementAtMount instanceof HTMLElement)
        focusedElementAtMount.focus();
    };
  }, []);

  const close = (event) => {
    if (event.target === event.currentTarget) closePrompt();
  };

  return (
    <>
      <div role="presentation" onMouseDown={close} className={blackOverlay}>
        <div
          className={promptContainerClass}
          role="presentation"
          onMouseDown={onMouseDownRef.current}
        >
          <h5>{text}</h5>
          <div className={buttonsContainer}>
            <button
              ref={closeButtonRef}
              type="button"
              onKeyDown={handleCloseButtonShiftTabRef.current}
              className={`${defaultButton} ${yes}`}
              onClick={handleCallback}
            >
              Yes
            </button>
            <button
              ref={submitButtonRef}
              onKeyDown={handleSubmitButtonTabRef.current}
              type="button"
              className={`${defaultButton} ${no}`}
              onClick={closePrompt}
            >
              No
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const createPrompt = (
  text: string,
  callback: () => void,
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>,
) => {
  const promptContainer = document.createElement("div");
  const root = ReactDOM.createRoot(promptContainer);
  document.body.append(promptContainer);

  const closePrompt = () => {
    root.unmount();
    promptContainer.remove();
  };

  const handleCallback = () => {
    callback();
    closePrompt();
  };

  root.render(
    <PromptComponent
      closePrompt={closePrompt}
      handleCallback={handleCallback}
      text={text}
      closeLastOpenedModalRef={closeLastOpenedModalRef}
    />,
  );
};
