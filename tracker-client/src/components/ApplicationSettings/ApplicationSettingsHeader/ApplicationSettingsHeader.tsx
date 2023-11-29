/* eslint-disable jsx-a11y/interactive-supports-focus */
import {
  MouseEvent,
  FocusEvent,
  KeyboardEvent,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { englishWeekdaysArray } from "../../../constants/constants";
import { defaultButton } from "../../../sharedStyles.module.css";
import { useAppSelector } from "../../../store";
import {
  header,
  closeButton,
  mobileSelectMenu,
  generalButton,
  buttonsDivider,
  colorsButton,
  firstRow,
  generalMenu,
  colorsMenu,
  daysMenu,
  daysButton,
  invalid,
} from "./ApplicationSettingsHeader.module.css";
import circledXIcon from "./assets/circledXIcon.svg";

interface IProps {
  headerRef: React.MutableRefObject<null | HTMLDivElement>;
  handleMobileMenuButtonClickRef: React.MutableRefObject<
    (event: MouseEvent<HTMLButtonElement>) => void
  >;
  selectedMobileMenu: "general" | "colors" | "days";
  priorityFocusedElementRef: React.MutableRefObject<
    HTMLElement | undefined | null
  >;
  generalTabRef: React.MutableRefObject<HTMLButtonElement | null>;
  daysTabRef: React.MutableRefObject<HTMLButtonElement | null>;
  colorsTabRef: React.MutableRefObject<HTMLButtonElement | null>;
  saveButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  closeButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  setShowApplicationSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
}

enum MobileMenusIndexes {
  general,
  days,
  colors,
}

export const ApplicationSettingsHeader = ({
  headerRef,
  handleMobileMenuButtonClickRef,
  selectedMobileMenu,
  generalTabRef,
  daysTabRef,
  closeButtonRef,
  priorityFocusedElementRef,
  saveButtonRef,
  colorsTabRef,
  setShowApplicationSettings,
}: IProps) => {
  const mobileMenusClasses = {
    general: generalMenu,
    colors: colorsMenu,
    days: daysMenu,
  };

  const tabsRefsRef = useRef([generalTabRef, daysTabRef, colorsTabRef]);
  const [focused, setFocused] = useState<{
    focused: number;
    skipFocus?: boolean;
  }>({ focused: MobileMenusIndexes[selectedMobileMenu] });

  const handleCloseButtonClickRef = useRef(() => {
    setShowApplicationSettings(false);
  });

  const handleKeyDownRef = useRef(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab") {
        if (colorsTabRef.current && generalTabRef.current) {
          if (event.shiftKey) {
            generalTabRef.current.focus();
          } else {
            colorsTabRef.current.focus();
          }
        } else {
          event.preventDefault();
        }
      } else if (
        event.key.includes("Arrow") === true &&
        event.target instanceof HTMLButtonElement
      ) {
        setFocused((focused) => {
          const grid: number[] = [0, 1, 2];
          const focusedElementHasElementLeftward = grid[focused.focused - 1];
          const focusedElementHasElementRightward = grid[focused.focused + 1];

          switch (event.key) {
            case "ArrowLeft":
              if (focusedElementHasElementLeftward !== undefined) {
                return {
                  focused: focusedElementHasElementLeftward,
                  skipFocus: false,
                };
              }
              break;
            case "ArrowRight":
              if (focusedElementHasElementRightward !== undefined) {
                return {
                  focused: focusedElementHasElementRightward,
                  skipFocus: false,
                };
              }
              break;
          }
          return focused;
        });
      }
    },
  );

  useEffect(() => {
    if (!focused.skipFocus) {
      const futureFocusedElementNode =
        tabsRefsRef.current[focused.focused].current;
      if (futureFocusedElementNode) futureFocusedElementNode.focus();
    }
  }, [focused, tabsRefsRef]);

  const { applicationSettings, close, general, days, colors } = useAppSelector(
    (state) => state.applicationSettings.languageObject.data,
  );

  const {
    weekdays,
    displayedCurrencyValidity,
    overtimeMultiplierValidity,
    hourlyRateValidity,
  } = useAppSelector((state) => state.applicationSettings);

  const generalMenuValidities = [
    displayedCurrencyValidity,
    overtimeMultiplierValidity,
    hourlyRateValidity,
  ];
  const daysMenuValidities = [];

  for (const weekday of englishWeekdaysArray) {
    const weekdayRequiredHoursValidity =
      weekdays[weekday].requiredHoursValidity;
    daysMenuValidities.push(weekdayRequiredHoursValidity);
  }

  const generalMenuAllFieldsAreValid = generalMenuValidities.every(
    (value) => value,
  );

  const daysMenuAllFieldsAreValid = daysMenuValidities.every((value) => value);

  const onKeyDownRef = useRef((event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      saveButtonRef.current?.focus();
    }
  });

  const tabsMenuRef = useRef<HTMLElement | null>(null);

  const onFocus = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      if (!tabsMenuRef.current?.contains(event.relatedTarget)) {
        event.preventDefault();
        event.stopPropagation();
        setFocused({
          focused: MobileMenusIndexes[selectedMobileMenu],
          skipFocus: false,
        });
      }
    },
    [selectedMobileMenu],
  );

  const handleClickRef = useRef(() => {
    priorityFocusedElementRef.current = closeButtonRef.current;
  });

  return (
    <header
      ref={headerRef}
      className={`${header} ${mobileMenusClasses[selectedMobileMenu]}`}
    >
      <div
        role="presentation"
        className={firstRow}
        onClick={handleClickRef.current}
      >
        <h1 id="applicationSettingsTitle">{applicationSettings}</h1>
        <button
          onKeyDown={onKeyDownRef.current}
          ref={closeButtonRef}
          onClick={handleCloseButtonClickRef.current}
          type="button"
          className={`${defaultButton} ${closeButton}`}
        >
          {close}
          <img src={circledXIcon} alt="" />
        </button>
      </div>
      <nav ref={tabsMenuRef}>
        <div
          className={mobileSelectMenu}
          role="menubar"
          onKeyDown={handleKeyDownRef.current}
          onFocus={onFocus}
        >
          <button
            role="menuitemradio"
            aria-checked={selectedMobileMenu === "general"}
            className={`${generalButton} ${
              !generalMenuAllFieldsAreValid ? invalid : ""
            }`}
            type="button"
            data-mobile-menu={"general"}
            ref={generalTabRef}
            onClick={handleMobileMenuButtonClickRef.current}
          >
            {general}
          </button>
          <hr className={buttonsDivider} aria-orientation="vertical"></hr>
          <button
            role="menuitemradio"
            aria-checked={selectedMobileMenu === "days"}
            className={`${daysButton} ${
              !daysMenuAllFieldsAreValid ? invalid : ""
            }`}
            type="button"
            data-mobile-menu={"days"}
            ref={daysTabRef}
            onClick={handleMobileMenuButtonClickRef.current}
          >
            {days}
          </button>
          <hr className={buttonsDivider} aria-orientation="vertical"></hr>
          <button
            role="menuitemradio"
            aria-checked={selectedMobileMenu === "colors"}
            className={colorsButton}
            data-mobile-menu={"colors"}
            type="button"
            ref={colorsTabRef}
            onClick={handleMobileMenuButtonClickRef.current}
          >
            {colors}
          </button>
        </div>
      </nav>
    </header>
  );
};
