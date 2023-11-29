import {
  createRef,
  FocusEvent,
  MouseEvent as ReactMouseEvent,
  KeyboardEvent,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

import defaultClasses from "./LanguagesDropdown.module.css";
import franceFlagIcon from "./assets/fr.svg";
import germanyFlagIcon from "./assets/de.svg";
import portugalFlagIcon from "./assets/pt.svg";
import romaniaFlagIcon from "./assets/ro.svg";
import russiaFlagIcon from "./assets/ru.svg";
import greeceFlagIcon from "./assets/gr.svg";
import hungaryFlagIcon from "./assets/hu.svg";
import netherlandsFlagIcon from "./assets/nl.svg";
import italyFlagIcon from "./assets/it.svg";
import spainFlagIcon from "./assets/es.svg";
import swedenFlagIcon from "./assets/se.svg";
import ukFlagIcon from "./assets/gb.svg";
import leftChevron from "./assets/leftChevron.svg";
import { defaultButton } from "../../../sharedStyles.module.css";
import { useState } from "react";
import {
  emptyObject,
  languageCodesArray,
  languageCodeType,
  languageNames,
} from "../../../constants/constants";
import { isDescendant } from "../../../utils/isDescendant";
import { getNextFocusableElement } from "../../../functions/getNextFocusableElement";
import { getPreviousFocusableElement } from "../../../functions/getPreviousFocusableElement";

const flagIcons = {
  fr: franceFlagIcon,
  de: germanyFlagIcon,
  pt: portugalFlagIcon,
  ro: romaniaFlagIcon,
  ru: russiaFlagIcon,
  el: greeceFlagIcon,
  hu: hungaryFlagIcon,
  nl: netherlandsFlagIcon,
  it: italyFlagIcon,
  es: spainFlagIcon,
  sv: swedenFlagIcon,
  en: ukFlagIcon,
};

interface IProps {
  selectedLanguage: languageCodeType;
  languageSelectorBarRef?: React.MutableRefObject<HTMLDivElement | null>;
  setLanguage: (languageCode: languageCodeType) => void;
  type: "general" | "onboarding" | "toolbar";
  usingMobileLayout?: boolean;
  focusWithinRef?: React.MutableRefObject<HTMLElement | null>;
  usingMobileLayoutRef?: React.MutableRefObject<boolean | undefined>;
  languagesListRef?: React.MutableRefObject<HTMLOListElement | null>;
  customClasses?: Partial<typeof defaultClasses>;
}

export const LanguagesDropdown = ({
  selectedLanguage,
  setLanguage,
  type,
  focusWithinRef,
  usingMobileLayout,
  usingMobileLayoutRef = undefined,
  languageSelectorBarRef: languageSelectorBarRefProp,
  languagesListRef: languagesListRefProp,
  customClasses = emptyObject,
}: IProps) => {
  const divRef = useRef<HTMLDivElement | null>(null);
  const oListRef = useRef<HTMLOListElement | null>(null);

  const languageSelectorBarRef = languageSelectorBarRefProp ?? divRef;
  const languagesListRef = languagesListRefProp ?? oListRef;

  const selectedLanguageIcon = flagIcons[selectedLanguage];
  const combinedClasses = { ...defaultClasses, ...customClasses };

  const {
    languagesListOther,
    selectedLanguageContainerOther,
    selectedLanguageContainer,
    selectedLanguageFlag,
    downArrowIcon,
    languagesList,
    languageOption,
    languagesListPosition,
    languagesListMargins,
    languageListItem,
    languagesListDimensions,
    languageSelectorBar,
    languagesListBackgroundColor,
    selectedLanguageIconsContainer,
    selectedLanguageIconsContainerOther,
    flagIcon,
    downArrowIconOther,
    showList: showListClass,
  } = combinedClasses;

  const languagesListClasses = `${languagesList} ${languagesListPosition} 
  ${languagesListOther} ${languagesListMargins} ${languagesListDimensions} 
  ${languagesListBackgroundColor}`;

  const [listState, setListState] = useState<{
    show: boolean;
    focused?: number;
    skipFocus?: boolean;
  }>({
    show: true,
    focused: -1,
  });

  const handleLanguageSelectorBarClickRef = useRef(() => {
    setListState((listState) => ({
      show: usingMobileLayoutRef?.current ? true : !listState.show,
      focused: undefined,
    }));
  });

  useLayoutEffect(() => {
    setListState({ show: !!usingMobileLayout, focused: -1, skipFocus: true });
  }, [usingMobileLayout]);

  const handleLanguageItemClickRef = useRef(
    (event: ReactMouseEvent<HTMLOListElement> | KeyboardEvent) => {
      const languageCode = (event.target as HTMLLIElement).dataset.languageCode;
      const languageIndex =
        (event.target as HTMLLIElement).dataset.languageIndex ?? -1;
      if (languageCode) setLanguage(languageCode as languageCodeType);
      // setShowList(false);
      setListState({
        show: !!usingMobileLayoutRef?.current,
        focused: usingMobileLayoutRef?.current ? +languageIndex : undefined,
        skipFocus: !!usingMobileLayoutRef?.current,
      });
    },
  );

  const setFocusRef = useRef(
    (direction: string, gridRowLength: number, numberOfElements: number) => {
      setListState((listState) => {
        const grid: number[][] = [];
        let focusedRow = -1;
        let focusedColumn = 0;
        let count = 0;
        let row = 0;
        while (count < numberOfElements) {
          const newRowLength =
            numberOfElements - count < gridRowLength
              ? numberOfElements - count
              : gridRowLength;

          const columns = Array.from({ length: newRowLength }, (v, column) => {
            if (listState.focused === count) {
              focusedRow = row;
              focusedColumn = column;
            }
            return count++;
          });
          grid.push(columns.map((column) => column));
          row++;
        }
        const focusedElementHasElementDownward =
          grid?.[focusedRow + 1]?.[focusedColumn];
        const focusedElementHasElementUpward =
          grid?.[focusedRow - 1]?.[focusedColumn];
        const focusedElementHasElementLeftward =
          grid?.[focusedRow]?.[focusedColumn - 1];
        const focusedElementHasElementRightward =
          grid?.[focusedRow]?.[focusedColumn + 1];

        switch (direction) {
          case "ArrowDown":
            if (focusedElementHasElementDownward !== undefined) {
              return { show: true, focused: focusedElementHasElementDownward };
            }
            break;
          case "ArrowUp":
            if (focusedElementHasElementUpward !== undefined) {
              return { show: true, focused: focusedElementHasElementUpward };
            } else if (listState.show) {
              return { show: true, focused: undefined };
            }
            break;
          case "ArrowLeft":
            if (
              focusedElementHasElementLeftward !== undefined &&
              listState.show
            ) {
              return { show: true, focused: focusedElementHasElementLeftward };
            }
            break;
          case "ArrowRight":
            if (
              focusedElementHasElementRightward !== undefined &&
              listState.show
            ) {
              return { show: true, focused: focusedElementHasElementRightward };
            }
            break;
        }
        return listState;
      });
    },
  );

  const handleKeyDownRef = useRef(
    (event: React.KeyboardEvent<HTMLOListElement | HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (event.currentTarget === languagesListRef.current) {
          handleLanguageItemClickRef.current(event);
        } else handleLanguageSelectorBarClickRef.current();
      } else if (event.key === "Escape") {
        if (languagesListRef.current?.offsetHeight) {
          setListState({
            show: !!usingMobileLayoutRef?.current,
            focused: undefined,
          });
          if (!usingMobileLayoutRef?.current) event.stopPropagation();
        }
      } else if (event.key === "Tab") {
        if (!usingMobileLayoutRef?.current) {
          setListState((listState) => ({
            ...listState,
            focused:
              listState.show && listState.focused !== undefined
                ? listState.focused + 1 - +event.shiftKey * 2
                : listState.focused,
            skipFocus: true,
          }));
        }
        if (
          usingMobileLayoutRef?.current &&
          event.shiftKey &&
          event.currentTarget === languagesListRef.current
        ) {
          event.preventDefault();
          languageSelectorBarRef.current?.focus();
        } else if (
          event.shiftKey &&
          event.currentTarget === languageSelectorBarRef.current
        ) {
          const previousFocusableElement = getPreviousFocusableElement(
            languageSelectorBarRef.current,
            focusWithinRef?.current,
          );
          event.preventDefault();
          previousFocusableElement?.focus();
        } else if (
          !event.shiftKey &&
          languagesListRef.current &&
          (usingMobileLayoutRef?.current ||
            event.currentTarget === languageSelectorBarRef.current)
        ) {
          const nextFocusableElement = getNextFocusableElement(
            languagesListRef.current,
            focusWithinRef?.current,
          );
          event.preventDefault();
          nextFocusableElement?.focus();
        }
      } else if (
        languagesListRef.current &&
        event.key.includes("Arrow") === true
      ) {
        const childrenElements = [
          ...languagesListRef.current.children,
        ] as HTMLElement[];
        const firstElementOffset = childrenElements[0].offsetTop;
        const firstElementInSecondRow = childrenElements.findIndex(
          (element) => element.offsetTop > firstElementOffset,
        );
        const numberOfElements = childrenElements.length;
        const rowLength =
          firstElementInSecondRow === -1
            ? numberOfElements
            : firstElementInSecondRow;

        event.preventDefault();
        setFocusRef.current(event.key, rowLength, numberOfElements);
      }
    },
  );

  const onFocusRef = useRef((event: FocusEvent<HTMLOListElement>) => {
    if (
      !languageSelectorBarRef.current?.contains(event.relatedTarget) &&
      !languagesListRef.current?.contains(event.relatedTarget)
    ) {
      event.preventDefault();
      event.stopPropagation();
      languageSelectorBarRef.current?.focus();
    }
  });

  useEffect(() => {
    if (!listState.skipFocus)
      if (listState.focused !== undefined && listState.focused >= 0) {
        const futureFocusedElementNode =
          languagesRefsRef.current[listState.focused].current;
        if (futureFocusedElementNode) futureFocusedElementNode.focus();
      } else if (listState.focused === undefined) {
        languageSelectorBarRef.current?.focus();
      }
  }, [languageSelectorBarRef, listState]);

  const languagesRefsRef = useRef(
    languageCodesArray.map(() => createRef<HTMLButtonElement>()),
  );

  const onBlurRef = useRef((event: FocusEvent) => {
    const activeElement = event.relatedTarget;
    const languageSelectorBarElement = languageSelectorBarRef.current;
    const languagesList = languagesListRef.current;
    if (
      !activeElement ||
      (activeElement instanceof HTMLElement &&
        !isDescendant(languageSelectorBarElement, activeElement) &&
        !isDescendant(languagesList, activeElement))
    ) {
      // setShowList(false);
      setListState({
        show: !!usingMobileLayoutRef?.current,
        focused: undefined,
        skipFocus: true,
      });
    }
    // setListState({ show: false, focused: undefined });
  });

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-controls={`${type}languagesList`}
        aria-label={`Preferred Language: ${languageNames[selectedLanguage]}`}
        aria-expanded={listState.show}
        onKeyDown={handleKeyDownRef.current}
        ref={languageSelectorBarRef}
        onClick={handleLanguageSelectorBarClickRef.current}
        onBlur={onBlurRef.current}
        className={`${defaultButton} ${languageSelectorBar}`}
        data-selected-language={languageNames[selectedLanguage]}
      >
        <div
          className={`${selectedLanguageContainer} ${selectedLanguageContainerOther}`}
        >
          <div
            className={`${selectedLanguageIconsContainer} ${selectedLanguageIconsContainerOther}`}
          >
            <img
              src={selectedLanguageIcon}
              className={selectedLanguageFlag}
              alt={`${languageNames[selectedLanguage]}`}
            />
            <img
              src={leftChevron}
              className={`${downArrowIcon} ${downArrowIconOther}`}
              alt=""
            />
          </div>
        </div>
      </div>
      <ol
        role="menu"
        aria-orientation="horizontal"
        aria-owns={`${type}languagesList`}
        id={`${type}languagesList`}
        onClick={handleLanguageItemClickRef.current}
        onKeyDown={handleKeyDownRef.current}
        onBlur={onBlurRef.current}
        onFocus={onFocusRef.current}
        ref={languagesListRef}
        className={`${languagesListClasses} 
        ${listState.show ? showListClass : ""}
        `}
      >
        {languageCodesArray.map((languageCode, index) => (
          <li className={languageListItem} key={index}>
            <button
              type="button"
              role="menuitemradio"
              aria-checked={languageCode === selectedLanguage}
              data-language-code={languageCode}
              data-language-index={index}
              ref={languagesRefsRef.current[index]}
              className={`${defaultButton} ${languageOption}`}
            >
              <img
                className={flagIcon}
                src={flagIcons[languageCode]}
                alt={`${languageNames[languageCode]}`}
              />
            </button>
          </li>
        ))}
      </ol>
    </>
  );
};
