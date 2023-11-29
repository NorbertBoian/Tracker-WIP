import leftChevronIcon from "./assets/leftChevron.svg";
import React, { useState, useEffect, useRef, useCallback } from "react";

import defaultClasses from "./Select.module.css";
import { MimicFocus } from "./MimicFocus";
import { getFutureOptionIndex } from "./functions/getFutureOptionIndex";
import {
  defaultButton,
  defaultInput,
} from "../../../../sharedStyles.module.css";
import { useStateRef } from "../../../../hooks/useStateRef";
import { useFocusOutline } from "../../../../hooks/useFocusOutline";
import { emptyObject } from "../../../../constants/constants";

interface IProps {
  valueSetter: (value: string, index: number) => void;
  name: string;
  value: string;
  options: string[];
  reversedArrows?: boolean;
  selectInputRef?: React.RefObject<HTMLInputElement>;
  customClasses?: Partial<typeof defaultClasses>;
}

const noFocus = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

export const Select = ({
  valueSetter,
  name,
  value,
  selectInputRef,
  options,
  reversedArrows,
  customClasses = emptyObject,
}: IProps) => {
  const [filter, setFilter] = useState("");
  const [show, setShow, showRef] = useStateRef(false);
  const [focused, setFocused, focusedRef] = useStateRef(0);
  const shouldFocusScroll = useRef(true);
  const filteredOptionsRef = useRef([""]);
  const valueRef = useRef(value);
  valueRef.current = value;
  const lowercaseName = name.toLowerCase();
  const combinedClasses = { ...defaultClasses, ...customClasses };

  const {
    selectContainer,
    listItem,
    optionList,
    rightChevron,
    leftChevron: leftChevronClass,
    inputContainer,
    selectedListItem,
    syntheticallyFocused,
    selectComponent,
    listCollapsed,
    leftArrowButton,
    focused: focusedClass,
    rightArrowButton,
  } = combinedClasses;

  const toggleListRef = useRef(
    (show: "toggle" | "clear" | "wipe" | boolean | React.SyntheticEvent) => {
      if (show === "wipe") {
        setShow(false);
        setFilter("");
      } else if (show === "clear") setFilter("");
      else if (typeof show === "boolean") setShow(show);
      else setShow((prevShow) => !prevShow);
    },
  );

  const searchHandlerRef = useRef(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!showRef.current) {
        toggleListRef.current(true);
      }
      setFilter(event.currentTarget.value);
    },
  );

  const callChangeHandler = useCallback(
    (option: string, hide = true) => {
      const optionIndex = options.indexOf(option);
      hide ? toggleListRef.current("wipe") : toggleListRef.current("clear");
      valueSetter(option, optionIndex);
    },
    [options, valueSetter],
  );

  const setFocusRef = useRef(
    (focus: "increase" | "decrease" | number, shouldScroll = true) => {
      shouldFocusScroll.current = shouldScroll;
      if (focus === "increase" || focus === "decrease") {
        setFocused((prevFocused) =>
          focus === "increase"
            ? prevFocused + 1
            : prevFocused - 1 < 0
            ? filteredOptionsRef.current.length - 1
            : prevFocused - 1,
        );
      } else setFocused(focus);
    },
  );

  const arrowNavHandler = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!showRef.current) {
          toggleListRef.current(true);
        }
      }
      switch (event.key) {
        case "ArrowDown":
          focusedRef.current === filteredOptionsRef.current.length - 1
            ? setFocusRef.current(0)
            : setFocusRef.current("increase");
          break;
        case "ArrowUp":
          focusedRef.current === 0
            ? setFocusRef.current(filteredOptionsRef.current.length - 1)
            : setFocusRef.current("decrease");
          break;
        case "Enter":
          if (showRef.current)
            callChangeHandler(filteredOptionsRef.current[focusedRef.current]);
          break;
        case "Escape":
          if (showRef.current) {
            event.stopPropagation();
            event.preventDefault();
          }
          toggleListRef.current("wipe");
          break;
      }
    },
    [callChangeHandler, focusedRef, showRef, setFocusRef],
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLUListElement>) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.dataset.index &&
        event.target.textContent
      ) {
        event.persist();
        callChangeHandler(event.target.textContent);
      }
    },
    [callChangeHandler],
  );

  const hideList = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (event.relatedTarget instanceof HTMLElement) {
        if (!event.relatedTarget.dataset[`select${lowercaseName}`]) {
          toggleListRef.current("wipe");
        }
      } else {
        toggleListRef.current("wipe");
      }
    },
    [lowercaseName],
  );

  const hoverHandlerRef = useRef(
    (
      event:
        | React.MouseEvent<HTMLUListElement>
        | React.FocusEvent<HTMLUListElement>,
    ) => {
      if (event.target instanceof HTMLElement && event.target.dataset.index) {
        event.preventDefault();
        event.stopPropagation();
        setFocusRef.current(+event.target.dataset.index, false);
      }
    },
  );

  const arrowControls = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const currentOptionIndex = options.findIndex(
        (option: string) => option === valueRef.current,
      );
      const futureOptionIndex = getFutureOptionIndex(
        event,
        reversedArrows,
        currentOptionIndex,
        options,
      );
      callChangeHandler(options[futureOptionIndex], false);
    },
    [callChangeHandler, options, reversedArrows],
  );

  useEffect(() => {
    if (filteredOptionsRef.current.length !== 0) setFocusRef.current(0);
    // {
    // if (filteredOptionsRef.current.length === 1) setFocusRef.current(-1);
    // else setFocusRef.current(0);
    // }
  }, [filter, filteredOptionsRef, setFocusRef]);

  useEffect(() => {
    const currentOptionIndexInFilteredOptions =
      filteredOptionsRef.current.findIndex(
        (option: string) => option === value,
      );
    setFocusRef.current(currentOptionIndexInFilteredOptions);
  }, [value, filteredOptionsRef]);

  useEffect(() => {
    if (!show) {
      setFocusRef.current(options.indexOf(value));
    }
  }, [options, show, value]);

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  const renderSearchResults = () => {
    filteredOptionsRef.current = options.filter((option) =>
      option.toLowerCase().includes(filter.toLowerCase()),
    );
    return filteredOptionsRef.current.map((option, index) => {
      const isFocused = focused === index ? true : false;
      const selected = value === option ? true : false;
      return (
        <MimicFocus
          sFocusedClass={syntheticallyFocused}
          scrollEnabled={shouldFocusScroll.current}
          active={isFocused}
          key={option}
        >
          <li
            {...{ [`data-select${lowercaseName}`]: true }}
            data-index={index}
            role="option"
            id={`${name}${index}`}
            tabIndex={-1}
            className={`${listItem} ${selected ? selectedListItem : ""}`}
            aria-selected={selected}
          >
            {option}
          </li>
        </MimicFocus>
      );
    });
  };

  return (
    <div role="presentation" className={selectComponent}>
      <div
        className={selectContainer}
        onKeyDown={arrowNavHandler}
        onBlur={hideList}
        role="presentation"
      >
        <div
          className={`${inputContainer} ${!show ? listCollapsed : ""} ${
            inputisFocused ? focusedClass : ""
          }`}
        >
          <button
            type="button"
            className={`${defaultButton} ${leftArrowButton}`}
            onMouseDown={noFocus}
            aria-label="Set previous option"
            onClick={arrowControls}
            id={`${name}leftarrow`}
            data-arrow="left"
          >
            <img
              className={leftChevronClass}
              src={leftChevronIcon}
              alt=""
              {...{ [`data-select${lowercaseName}`]: true }}
            />
          </button>
          <input
            type="text"
            className={defaultInput}
            onClick={toggleListRef.current}
            value={filter}
            autoComplete="off"
            onFocus={onInputFocusRef.current}
            onBlur={onInputBlurRef.current}
            onMouseDown={onInputMouseDownRef.current}
            placeholder={value}
            onChange={searchHandlerRef.current}
            {...{ [`data-select${lowercaseName}`]: true }}
            aria-controls={`${
              show ? `${name}dropdown ` : ""
            }${name}leftarrow ${name}rightarrow`}
            aria-expanded={show}
            aria-autocomplete="list"
            aria-activedescendant={
              show
                ? focused >= 0
                  ? `${name}${focused}`
                  : undefined
                : undefined
            }
            role="combobox"
            {...(selectInputRef ? { ref: selectInputRef } : {})}
          />
          <button
            type="button"
            id={`${name}rightarrow`}
            aria-label="Set next option"
            className={`${defaultButton} ${rightArrowButton}`}
            onMouseDown={noFocus}
            onClick={arrowControls}
            data-arrow="right"
          >
            <img
              className={rightChevron}
              src={leftChevronIcon}
              alt=""
              {...{ [`data-select${lowercaseName}`]: true }}
            />
          </button>
        </div>

        {show ? (
          // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
          <ul
            id={`${name}dropdown`}
            onFocus={hoverHandlerRef.current}
            onMouseOver={hoverHandlerRef.current}
            onClick={handleClick}
            {...{ [`data-select${lowercaseName}`]: true }}
            className={optionList}
          >
            {renderSearchResults()}
          </ul>
        ) : null}
      </div>
    </div>
  );
};
