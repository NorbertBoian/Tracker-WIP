import defaultInputsSectionClasses from "./InputsSection.module.css";
import hourlyRateInputClasses from "./HourlyRateInput.module.css";
import overtimeMultiplierClasses from "./OvertimeMultiplier.module.css";
import displayedCurrencyClasses from "./DisplayedCurrency.module.css";
import { LanguagesDropdown } from "../LanguagesDropdown/LanguagesDropdown";
import { TwoColoredInput } from "../TwoColoredInput/TwoColoredInput";
import { store, useAppDispatch, useAppSelector } from "../../../store";
import { emptyObject, languageCodeType } from "../../../constants/constants";
import {
  applicationSettingChanged,
  applicationSettingsLanguageChanged,
} from "../../../slices/applicationSettingsSlice";
import {
  displayedCurrencyNoEmptyStringRegex,
  displayedCurrencyRegex,
  hourlyRateNoEmptyStringRegex,
  hourlyRateRegex,
  overtimeMultiplierNoEmptyStringRegex,
  overtimeMultiplierRegex,
} from "../../../../../shared/constants";
import { useCallback, useEffect, useRef, useState } from "react";

const defaultClasses = {
  inputsSectionClasses: defaultInputsSectionClasses,
  hourlyRateInputClasses,
  overtimeMultiplierClasses,
  displayedCurrencyClasses,
};

type customClassesType = {
  [key in keyof typeof defaultClasses]: Partial<typeof defaultClasses[key]>;
};

interface IProps {
  hourlyRatePlaceholder: string;
  overtimeMultiplierPlaceholder: string;
  displayedCurrencyPlaceholder: string;
  type: "onboarding" | "general";
  languageSelectorBarRef: React.MutableRefObject<HTMLDivElement | null>;
  hourlyRateCursor: number[];
  overtimeMultiplierCursor: number[];
  usingMobileLayout?: boolean;
  settingsContainerRef: React.MutableRefObject<HTMLElement | null>;
  usingMobileLayoutRef?: React.MutableRefObject<boolean | undefined>;
  customClasses?: customClassesType;
  preferredLanguageDescriptionRef?: React.MutableRefObject<HTMLDivElement | null>;
  languagesListRef: React.MutableRefObject<HTMLOListElement | null>;
  threeInputsFieldSetRef?: React.MutableRefObject<HTMLFieldSetElement | null>;
}

const emptyCustomClasses = {
  inputsSectionClasses: emptyObject,
  hourlyRateInputClasses: emptyObject,
  overtimeMultiplierClasses: emptyObject,
  displayedCurrencyClasses: emptyObject,
};

export const InputsSection = ({
  hourlyRatePlaceholder,
  languageSelectorBarRef,
  settingsContainerRef,
  overtimeMultiplierPlaceholder,
  usingMobileLayout,
  displayedCurrencyPlaceholder,
  usingMobileLayoutRef,
  hourlyRateCursor,
  preferredLanguageDescriptionRef,
  languagesListRef,
  threeInputsFieldSetRef,
  overtimeMultiplierCursor,
  type,
  customClasses = emptyCustomClasses,
}: IProps) => {
  const combinedClasses = {
    ...customClasses,
    inputsSectionClasses: {
      ...defaultClasses.inputsSectionClasses,
      ...customClasses.inputsSectionClasses,
    },
  };
  const {
    inputsSectionClasses,
    hourlyRateInputClasses,
    overtimeMultiplierClasses,
    displayedCurrencyClasses,
  } = combinedClasses;

  const {
    inputsContainer,
    inputsContainerVisibility,
    languagesListOther,
    selectedLanguageContainerOther,
    languagesListPosition,
    languagesListMargins,
    languagesListDimensions,
    languageSelectorBar,
    selectedLanguageContainer,
    selectedLanguageIconsContainerOther,
    horizontalDivider,
    downArrowIconOther,
    preferredLanguageDescription,
    preferredLanguageDescriptionVisibility,
    defaultRatesDescription,
    defaultRatesDescriptionVisibility,
    dimensions,
    textColor,
    focused,
    invalid,
  } = inputsSectionClasses;

  const hourlyRateInputCustomClasses = {
    dimensions,
    textColor,
    invalid,
    focused,
    ...hourlyRateInputClasses,
  };
  const overtimeMultiplierCustomClasses = {
    dimensions,
    textColor,
    invalid,
    focused,
    ...overtimeMultiplierClasses,
  };
  const displayedCurrencyCustomClasses = {
    dimensions,
    textColor,
    invalid,
    focused,
    ...displayedCurrencyClasses,
  };

  const languagesDropdownCustomClasses = {
    languagesListOther,
    languagesListPosition,
    selectedLanguageContainerOther,
    languagesListMargins,
    languagesListDimensions,
    languageSelectorBar,
    selectedLanguageContainer,
    selectedLanguageIconsContainerOther,
    downArrowIconOther,
  };

  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );
  const languageCode = useAppSelector(
    (state) => state.applicationSettings.languageCode,
  );
  const hourlyRate = useAppSelector(
    (state) => state.applicationSettings.hourlyRate,
  );
  const overtimeMultiplier = useAppSelector(
    (state) => state.applicationSettings.overtimeMultiplier,
  );
  const displayedCurrency = useAppSelector(
    (state) => state.applicationSettings.displayedCurrency,
  );

  const dispatch = useAppDispatch();

  const setLanguageCode = useCallback(
    (languageCode: languageCodeType) => {
      dispatch(
        applicationSettingsLanguageChanged({
          data: languageCode,
          isFetching: false,
          isSuccess: true,
        }),
      );
    },
    [dispatch],
  );

  const setHourlyRateRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { hourlyRate } = store.getState().applicationSettings;
        dispatch(
          applicationSettingChanged({
            property: "hourlyRate",
            value: value(hourlyRate),
          }),
        );
      } else {
        dispatch(applicationSettingChanged({ property: "hourlyRate", value }));
      }
    },
  );

  const setOvertimeMultiplierRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { overtimeMultiplier } = store.getState().applicationSettings;
        dispatch(
          applicationSettingChanged({
            property: "overtimeMultiplier",
            value: value(overtimeMultiplier),
          }),
        );
      } else {
        dispatch(
          applicationSettingChanged({ property: "overtimeMultiplier", value }),
        );
      }
    },
  );

  const setDisplayedCurrencyRef = useRef(
    (value: { value: string } | ((value: string) => { value: string })) => {
      if (value instanceof Function) {
        const { displayedCurrency } = store.getState().applicationSettings;
        dispatch(
          applicationSettingChanged({
            property: "displayedCurrency",
            value: value(displayedCurrency).value,
          }),
        );
      } else {
        dispatch(
          applicationSettingChanged({
            property: "displayedCurrency",
            value: value.value,
          }),
        );
      }
    },
  );

  const hourlyRateInputRef = useRef<HTMLInputElement | null>(null);
  const overtimeMultiplierInputRef = useRef<HTMLInputElement | null>(null);
  const displayedCurrencyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (hourlyRateInputRef.current)
      dispatch(
        applicationSettingChanged({
          property: "hourlyRateValidity",
          value: hourlyRateInputRef.current.validity.valid,
        }),
      );
  }, [dispatch, hourlyRate]);

  useEffect(() => {
    if (overtimeMultiplierInputRef.current)
      dispatch(
        applicationSettingChanged({
          property: "overtimeMultiplierValidity",
          value: overtimeMultiplierInputRef.current.validity.valid,
        }),
      );
  }, [dispatch, overtimeMultiplier]);

  useEffect(() => {
    if (displayedCurrencyInputRef.current)
      dispatch(
        applicationSettingChanged({
          property: "displayedCurrencyValidity",
          value: displayedCurrencyInputRef.current.validity.valid,
        }),
      );
  }, [dispatch, displayedCurrency]);

  const {
    preferredLanguage,
    hourlyRate: hourlyRateLocalizedString,
    overtimeMultiplier: overtimeMultiplierLocalizedString,
    displayedCurrency: displayedCurrencyLocalizedString,
    defaultRatesAndDisplayedCurrency,
  } = languageObject.data;

  const [hourlyRateValidity, setHourlyRateValidity] = useState(true);

  useEffect(() => {
    setHourlyRateValidity(!!hourlyRateInputRef.current?.validity.valid);
  }, [hourlyRate, setHourlyRateValidity]);

  const [overtimeMultiplierValidity, setOvertimeMultiplierValidity] =
    useState(true);

  useEffect(() => {
    setOvertimeMultiplierValidity(
      !!overtimeMultiplierInputRef.current?.validity.valid,
    );
  }, [overtimeMultiplier, setOvertimeMultiplierValidity]);

  const [displayedCurrencyValidity, setDisplayedCurrencyValidity] =
    useState(true);

  useEffect(() => {
    setDisplayedCurrencyValidity(
      !!displayedCurrencyInputRef.current?.validity.valid,
    );
  }, [displayedCurrency]);

  return (
    <>
      <div
        className={`${preferredLanguageDescription} ${preferredLanguageDescriptionVisibility}`}
        {...(preferredLanguageDescriptionRef
          ? { ref: preferredLanguageDescriptionRef }
          : {})}
      >
        <label id={`${type}preferredLanguageLabel`}>{preferredLanguage}</label>
        <hr className={horizontalDivider}></hr>
      </div>
      <LanguagesDropdown
        languagesListRef={languagesListRef}
        languageSelectorBarRef={languageSelectorBarRef}
        selectedLanguage={languageCode.data ?? "en"}
        type={type}
        focusWithinRef={settingsContainerRef}
        usingMobileLayout={usingMobileLayout}
        usingMobileLayoutRef={usingMobileLayoutRef}
        setLanguage={setLanguageCode}
        customClasses={languagesDropdownCustomClasses}
      />
      <fieldset
        className={`${inputsContainer} ${inputsContainerVisibility}`}
        {...(threeInputsFieldSetRef ? { ref: threeInputsFieldSetRef } : {})}
      >
        <TwoColoredInput
          valid={hourlyRateValidity}
          value={hourlyRate}
          type="decimal"
          expectedPattern={
            type === "general" ? hourlyRateNoEmptyStringRegex : hourlyRateRegex
          }
          cursor={hourlyRateCursor}
          placeholder={hourlyRatePlaceholder}
          setValueRef={setHourlyRateRef}
          maxLength={6}
          required={type === "general"}
          descriptionString={hourlyRateLocalizedString}
          customClasses={hourlyRateInputCustomClasses}
          refProp={hourlyRateInputRef}
        />
        <TwoColoredInput
          valid={overtimeMultiplierValidity}
          value={overtimeMultiplier}
          expectedPattern={
            type === "general"
              ? overtimeMultiplierNoEmptyStringRegex
              : overtimeMultiplierRegex
          }
          placeholder={overtimeMultiplierPlaceholder}
          cursor={overtimeMultiplierCursor}
          type="decimal"
          setValueRef={setOvertimeMultiplierRef}
          required={type === "general"}
          maxLength={5}
          descriptionString={overtimeMultiplierLocalizedString}
          customClasses={overtimeMultiplierCustomClasses}
          refProp={overtimeMultiplierInputRef}
        />
        <TwoColoredInput
          valid={displayedCurrencyValidity}
          type="currency"
          value={displayedCurrency}
          expectedPattern={
            type === "general"
              ? displayedCurrencyNoEmptyStringRegex
              : displayedCurrencyRegex
          }
          setValueRef={setDisplayedCurrencyRef}
          placeholder={displayedCurrencyPlaceholder}
          maxLength={5}
          required={type === "general"}
          descriptionString={displayedCurrencyLocalizedString}
          customClasses={displayedCurrencyCustomClasses}
          refProp={displayedCurrencyInputRef}
        />
      </fieldset>
      <div
        className={`${defaultRatesDescription} ${defaultRatesDescriptionVisibility}`}
      >
        <div>{defaultRatesAndDisplayedCurrency}</div>
        <div className={horizontalDivider}></div>
      </div>
    </>
  );
};
