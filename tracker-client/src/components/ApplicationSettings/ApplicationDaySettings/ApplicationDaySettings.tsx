import {
  useCallback,
  useEffect,
  useRef,
  useState,
  KeyboardEvent,
  useMemo,
  useLayoutEffect,
} from "react";
import { DaySettingsBar } from "../../Shared/DaySettingsBar/DaySettingsBar";
import { ColorPicker } from "../../ColorPicker/ColorPicker";
import ApplicationDaySettingsClasses from "./ApplicationDaySettings.module.css";
import { defaultButton } from "../../../sharedStyles.module.css";

import customColorPickerBarClasses from "./colorPickerBar.module.css";
import customColorPickerOverlayClasses from "./colorPickerOverlay.module.css";
import { getShouldShowAsModalCreator } from "./functions/getShouldShowAsModalCreator";
import { getColorPickerOverlayPositionCreator } from "./functions/getColorPickerOverlayPositionCreator";
import { DayPreviewComponent } from "../ApplicationSettingsScrollableArea/DayPreviewComponent/DayPreviewComponent";

import {
  applicationSettingsWeekdayDisabledDayToggled,
  applicationSettingsWeekdayPropertyChanged,
} from "../../../slices/applicationSettingsSlice";
import {
  defaultDaysColors,
  englishWeekdayType,
} from "../../../constants/constants";
import { store, useAppDispatch, useAppSelector } from "../../../store";
import { requiredHoursNoEmptyStringRegex } from "../../../../../shared/constants";
import { getRateLimitedFunction } from "../../../functions/getRateLimitedFunction";

const {
  disabledDay: customColorPickerOverlayDisabledDayClass,
  ...customColorPickerOverlayClassesWithoutDisabledDay
} = customColorPickerOverlayClasses;
const {
  disabledDay: customColorPickerBarDisabledDayClass,
  ...customColorPickerBarClassesWithoutDisabledDay
} = customColorPickerBarClasses;

const {
  applicationDaySettingsComponent,
  disabledDay: disabledDayClass,
  colorPickerWrapper,
  pickerDisabledDay,
  pickerEnabledDay,
  defaultColorButton,
  colorPickerMainGradientWidth,
  colorPickerMainGradientHeight,
  hueSliderWidth,
  coloredRectangleBorderColor,
  hexTextInput,
  secondDaySettingDivider,
  colorsMenu,
  daysMenu,
  generalMenu,
  ...daySettingsBarCustomClasses
} = ApplicationDaySettingsClasses;

const customColorPickerClasses = {
  colorPickerOverlay: customColorPickerOverlayClassesWithoutDisabledDay,
  colorPickerBar: customColorPickerBarClassesWithoutDisabledDay,
  colorPickerWrapper,
};

const { daySettingsDivider } = daySettingsBarCustomClasses;

export type getDayPreviewComponentType = (
  hsvColor: [number, number, number],
  firstFocusableElementRef: React.MutableRefObject<HTMLButtonElement | null>,
  firstFocusableElementKeyDownHandlerRef: React.MutableRefObject<
    (event: KeyboardEvent<HTMLButtonElement>) => void
  >,
) => JSX.Element;

interface IProps {
  dayName: string;
  englishDayName: englishWeekdayType;
  footerRef: React.MutableRefObject<null | HTMLDivElement>;
  headerRef: React.MutableRefObject<null | HTMLDivElement>;
  applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>;
  previewDayComponentFirstRowWrapperRef: React.MutableRefObject<null | HTMLDivElement>;
  selectedMobileMenu: "general" | "colors" | "days";
  setExampleDayName: React.Dispatch<React.SetStateAction<string>>;
  setExampleDayColor: (color: [number, number, number]) => void;
  exampleDayName: string;
  usingMobileLayout: boolean;
  cursor: number[];
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
  scrollableAreaRef: React.MutableRefObject<null | HTMLDivElement>;
  applicationDaySettingsBarRef: React.MutableRefObject<null | HTMLFieldSetElement>;
  defaultColorButtonRef: React.MutableRefObject<null | HTMLButtonElement>;
  colorPickerRef: React.MutableRefObject<null | HTMLDivElement>;
}

let timeout: undefined | NodeJS.Timeout = undefined;

const mobileMenusClasses = {
  general: generalMenu,
  colors: colorsMenu,
  days: daysMenu,
};

const requiredHoursInputOptions = {
  required: true,
  minLength: 1,
  maxLength: 2,
  pattern: requiredHoursNoEmptyStringRegex.toString().slice(1, -1),
};

const emptyArray: never[] = [];

export const ApplicationDaySettings = ({
  dayName,
  englishDayName,
  footerRef,
  cursor,
  headerRef,
  applicationSettingsContainerRef,
  previewDayComponentFirstRowWrapperRef,
  setExampleDayName,
  closeLastOpenedModalRef,
  setExampleDayColor,
  exampleDayName,
  usingMobileLayout,
  selectedMobileMenu,
  scrollableAreaRef,
  applicationDaySettingsBarRef,
  defaultColorButtonRef,
  colorPickerRef,
}: IProps) => {
  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );
  const { example, default: theWordDefaultLocalized } = languageObject.data;

  const getInitialStateRef = useRef(() => {
    const { applicationSettings } = store.getState().main;
    return (
      applicationSettings.data?.weekdays[englishDayName].color ??
      defaultDaysColors[englishDayName]
    );
  });

  const debouncedSetExampleDayNameRef = useRef((value: string) => {
    if (timeout) clearTimeout(timeout);
    const setExampleDayNameWrapper = () => {
      setExampleDayName(value);
    };
    timeout = setTimeout(setExampleDayNameWrapper, 100);
  });

  const setExampleDayNameOnColorPickerOverlayMount = useCallback(
    (setShowColorPickerOverlay: (boolean: boolean) => void) => {
      closeLastOpenedModalRef.current = [
        ...closeLastOpenedModalRef.current,
        () => setShowColorPickerOverlay(false),
      ];
      const debouncedSetExampleDayName = debouncedSetExampleDayNameRef.current;
      debouncedSetExampleDayName(dayName);
    },
    [closeLastOpenedModalRef, dayName],
  );

  const setExampleDayNameOnColorPickerOverlayUnmount = useCallback(() => {
    closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
      0,
      -1,
    );
    const debouncedSetExampleDayName = debouncedSetExampleDayNameRef.current;
    debouncedSetExampleDayName(example);
  }, [closeLastOpenedModalRef, example]);

  const getShouldShowAsModalRef = useRef(
    getShouldShowAsModalCreator(
      previewDayComponentFirstRowWrapperRef,
      headerRef,
      footerRef,
      applicationSettingsContainerRef,
    ),
  );

  // const getShouldShowAsModal = useMemo(
  //   () =>
  //     getShouldShowAsModalCreator(
  //       previewDayComponentFirstRowWrapperRef,
  //       headerRef,
  //       footerRef,
  //       applicationSettingsContainerRef,
  //       usingMobileLayout,
  //     ),
  //   [
  //     applicationSettingsContainerRef,
  //     footerRef,
  //     headerRef,
  //     previewDayComponentFirstRowWrapperRef,
  //     usingMobileLayout,
  //   ],
  // );

  const getColorPickerOverlayPositionRef = useRef(
    getColorPickerOverlayPositionCreator(
      previewDayComponentFirstRowWrapperRef,
      headerRef,
      footerRef,
      applicationSettingsContainerRef,
    ),
  );

  const getDayPreviewComponent: getDayPreviewComponentType = useCallback(
    (
      hsvColor: [number, number, number],
      firstFocusableElementRef: React.MutableRefObject<HTMLButtonElement | null>,
      firstFocusableElementKeyDownHandlerRef: React.MutableRefObject<
        (event: KeyboardEvent<HTMLButtonElement>) => void
      >,
    ) => (
      <DayPreviewComponent
        dayString={dayName}
        dayNameColor={hsvColor}
        toggleStatsButtonRef={firstFocusableElementRef}
        toggleStatsButtonKeyDownHandlerRef={
          firstFocusableElementKeyDownHandlerRef
        }
      />
    ),
    [dayName],
  );

  const { requiredHours, disabledDay } = useAppSelector(
    (state) => state.applicationSettings.weekdays[englishDayName],
  );

  const dispatch = useAppDispatch();

  const requiredHoursChangeHandlerRef = useRef(
    (
      value:
        | { value: string; cursor?: number[] }
        | ((value: string) => { value: string; cursor?: number[] }),
    ) => {
      if (value instanceof Function) {
        const { requiredHours } =
          store.getState().applicationSettings.weekdays[englishDayName];
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "requiredHours",
            value: value(requiredHours),
          }),
        );
      } else {
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "requiredHours",
            value,
          }),
        );
      }
    },
  );

  const toggleDisabledDay = useCallback(() => {
    dispatch(applicationSettingsWeekdayDisabledDayToggled(englishDayName));
  }, [dispatch, englishDayName]);

  const setColorRef = useRef(
    (
      color:
        | [number, number, number]
        | ((
            currentColor: [
              number | undefined,
              number | undefined,
              number | undefined,
            ],
          ) => [number, number, number]),
    ) => {
      if (typeof color === "function") {
        const newColor = color([undefined, undefined, undefined]);
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "color",
            value: newColor,
          }),
        );
      } else {
        dispatch(
          applicationSettingsWeekdayPropertyChanged({
            weekday: englishDayName,
            property: "color",
            value: color,
          }),
        );
      }
    },
  );

  const rateLimitedSetColorRef = useRef(
    getRateLimitedFunction(setColorRef.current, 500, false, 100),
  );

  const [hsvColor, setHsvColor] = useState<[number, number, number]>(
    getInitialStateRef.current,
  );

  const handleDefaultColorButtonRef = useRef(() => {
    setHsvColor(defaultDaysColors[englishDayName]);
  });

  useEffect(() => {
    rateLimitedSetColorRef.current(hsvColor);
  }, [hsvColor]);

  useEffect(() => {
    if (dayName === exampleDayName) setExampleDayColor(hsvColor);
    else if (exampleDayName === example) setExampleDayColor([0, 0, 1]);
  }, [hsvColor, dayName, exampleDayName, setExampleDayColor, example]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      dispatch(
        applicationSettingsWeekdayPropertyChanged({
          weekday: englishDayName,
          property: "requiredHoursValidity",
          value: inputRef.current?.validity.valid,
        }),
      );
    }
  }, [dispatch, englishDayName, requiredHours]);

  const {
    // hourRequirementsExplanation,
    // enableDisableDaysExplanation,
    defaultColorExplanation,
    dayDisplayColorExplanation,
  } = useAppSelector((state) => state.applicationSettings.languageObject.data);

  const [rerenderOverlay, setRerenderOverlay] = useState(emptyArray);

  // const [
  //   rerenderOverlayAfterLayoutShiftPaint,
  //   setRerenderOverlayAfterLayoutShiftPaint,
  // ] = useState([]);

  useLayoutEffect(() => {
    setRerenderOverlay((rerenderOverlay) =>
      rerenderOverlay !== emptyArray ? [] : rerenderOverlay,
    );
    // setRerenderOverlayAfterLayoutShiftPaint([]);
  }, [usingMobileLayout]);

  // const rerenderOverlay = useMemo(
  //   () => [],
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   [ usingMobileLayout],
  // );

  const colorPickerComponent = (
    <ColorPicker
      key={1}
      colorPickerRef={colorPickerRef}
      hsvColor={hsvColor}
      setHsvColor={setHsvColor}
      languageObject={languageObject.data}
      getShouldShowAsModal={getShouldShowAsModalRef.current}
      getColorPickerOverlayPosition={getColorPickerOverlayPositionRef.current}
      getPreviewInModalComponent={getDayPreviewComponent}
      colorPickerOverlayMountCallback={
        setExampleDayNameOnColorPickerOverlayMount
      }
      colorPickerOverlayUnmountCallback={
        setExampleDayNameOnColorPickerOverlayUnmount
      }
      id={`${englishDayName}ColorPicker`}
      label={dayDisplayColorExplanation}
      customClasses={customColorPickerClasses}
      scrollableAreaRef={scrollableAreaRef}
      rerenderOverlay={rerenderOverlay}
      debug={englishDayName}
    />
  );

  const defaultColorButtonJsx = (
    <button
      key={2}
      ref={defaultColorButtonRef}
      aria-label={defaultColorExplanation}
      type="button"
      onClick={handleDefaultColorButtonRef.current}
      className={`${defaultButton} ${defaultColorButton}`}
    >
      {theWordDefaultLocalized}
    </button>
  );

  const colorSection = usingMobileLayout
    ? [colorPickerComponent, defaultColorButtonJsx]
    : [defaultColorButtonJsx, colorPickerComponent];

  return (
    <fieldset
      ref={applicationDaySettingsBarRef}
      className={`${applicationDaySettingsComponent} ${
        disabledDay
          ? `${disabledDayClass} ${customColorPickerOverlayDisabledDayClass} ${customColorPickerBarDisabledDayClass}`
          : ""
      } ${mobileMenusClasses[selectedMobileMenu]}`}
    >
      <DaySettingsBar
        // hourRequirementsLabel={hourRequirementsExplanation}
        // enableDisableDaysLabel={enableDisableDaysExplanation}
        inputRef={inputRef}
        dayName={dayName}
        requiredHoursInputOptions={requiredHoursInputOptions}
        disabledDay={disabledDay}
        requiredHoursValue={requiredHours}
        languageObject={languageObject.data}
        requiredHoursPlaceholder="!"
        customClasses={daySettingsBarCustomClasses}
        cursor={cursor}
        requiredHoursChangeHandlerRef={requiredHoursChangeHandlerRef}
        toggleDisabledDay={toggleDisabledDay}
      />
      <hr className={`${daySettingsDivider} ${secondDaySettingDivider}`}></hr>
      {colorSection}
    </fieldset>
  );
};
