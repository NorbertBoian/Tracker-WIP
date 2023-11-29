import { useEffect, useRef, useState } from "react";
import { hsvToHex } from "../../../utils/colorConversions";
import { InputsSection } from "../../Shared/InputsSection/InputsSection";
import { ApplicationDaySettings } from "../ApplicationDaySettings/ApplicationDaySettings";
import {
  scrollableArea,
  generalMenu,
  previewContainerOther,
} from "./ApplicationSettingsScrollableArea.module.css";
import { AutosaveSection } from "./AutosaveSection/AutosaveSection";
import { DayPreviewComponent } from "./DayPreviewComponent/DayPreviewComponent";
import { ExplanationsSection } from "./ExplanationsSection/ExplanationsSection";
import inputSectionCustomClasses from "./InputsSection.module.css";
import displayedCurrencyCustomClasses from "./DisplayedCurrency.module.css";
import hourlyRateInputCustomClasses from "./HourlyRateInput.module.css";
import overtimeMultiplierCustomClasses from "./OvertimeMultiplier.module.css";
import { useAppSelector } from "../../../store";
import { englishWeekdaysArray } from "../../../constants/constants";

const { notGeneralMenu, ...inputsSectionParentCustomClasses } =
  inputSectionCustomClasses;

const inputsSectionCustomClasses = {
  inputsSectionClasses: inputsSectionParentCustomClasses,
  hourlyRateInputClasses: hourlyRateInputCustomClasses,
  overtimeMultiplierClasses: overtimeMultiplierCustomClasses,
  displayedCurrencyClasses: displayedCurrencyCustomClasses,
};

interface IProps {
  applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>;
  footerRef: React.MutableRefObject<null | HTMLDivElement>;
  languageSelectorBarRef: React.MutableRefObject<HTMLDivElement | null>;
  headerRef: React.MutableRefObject<null | HTMLDivElement>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
  selectedMobileMenu: "colors" | "general" | "days";
  usingMobileLayout: boolean;
  usingMobileLayoutRef: React.MutableRefObject<boolean | undefined>;
  applicationDaySettingsBarsRefsRef: React.MutableRefObject<
    React.RefObject<HTMLFieldSetElement>[]
  >;
  defaultColorButtonsRefsRef: React.MutableRefObject<
    React.RefObject<HTMLButtonElement>[]
  >;
  colorPickersRefsRef: React.MutableRefObject<
    React.RefObject<HTMLDivElement>[]
  >;
  dayPreviewRef: React.MutableRefObject<null | HTMLDivElement>;
  autosaveSectionRef: React.MutableRefObject<null | HTMLFieldSetElement>;
  explanationsSectionRef: React.MutableRefObject<null | HTMLDivElement>;
  preferredLanguageDescriptionRef: React.MutableRefObject<null | HTMLDivElement>;
  languagesListRef: React.MutableRefObject<null | HTMLOListElement>;
  threeInputsFieldSetRef: React.MutableRefObject<null | HTMLFieldSetElement>;
}

export const ApplicationSettingsScrollableArea = ({
  applicationSettingsContainerRef,
  closeLastOpenedModalRef,
  footerRef,
  usingMobileLayout,
  languageSelectorBarRef,
  usingMobileLayoutRef,
  dayPreviewRef,
  autosaveSectionRef,
  explanationsSectionRef,
  preferredLanguageDescriptionRef,
  languagesListRef,
  threeInputsFieldSetRef,
  headerRef,
  selectedMobileMenu,
  applicationDaySettingsBarsRefsRef,
  defaultColorButtonsRefsRef,
  colorPickersRefsRef,
}: IProps) => {
  const previewDayComponentFirstRowWrapperRef = useRef(null);
  const { example, weekdaysArray, seconds } = useAppSelector(
    (state) => state.applicationSettings.languageObject.data,
  );

  const cursors = useAppSelector((state) => state.applicationSettings.cursors);

  const [exampleDayName, setExampleDayName] = useState(example);

  const exampleDayNameElementRef = useRef<HTMLHeadingElement | null>(null);

  const changeExampleDayNameElementColorRef = useRef(
    (color: [number, number, number]) => {
      if (exampleDayNameElementRef.current) {
        const dayNameColorString = hsvToHex(color);
        exampleDayNameElementRef.current.style.color = dayNameColorString;
      }
    },
  );

  const weekdaysMondayFirst = [...weekdaysArray.slice(1), weekdaysArray[0]];

  const englishWeekdaysMondayFirst = [
    ...englishWeekdaysArray.slice(1),
    englishWeekdaysArray[0],
  ];

  const scrollableAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollableAreaRef.current) scrollableAreaRef.current.scrollTop = 0;
  }, [selectedMobileMenu]);

  const mobileMenusClasses = {
    general: generalMenu,
    colors: "",
    days: "",
  };

  useEffect(() => {
    setExampleDayName(example);
  }, [example]);

  const {
    hourlyRate: hourlyRateCursor,
    overtimeMultiplier: overtimeMultiplierCursor,
    weekdays: weekdaysCursors,
  } = cursors;

  return (
    <section
      ref={scrollableAreaRef}
      className={`${scrollableArea} ${mobileMenusClasses[selectedMobileMenu]} ${
        selectedMobileMenu !== "general" ? notGeneralMenu : ""
      }`}
    >
      <InputsSection
        type="general"
        languageSelectorBarRef={languageSelectorBarRef}
        hourlyRatePlaceholder="!"
        overtimeMultiplierPlaceholder="!"
        displayedCurrencyPlaceholder="!"
        settingsContainerRef={applicationSettingsContainerRef}
        hourlyRateCursor={hourlyRateCursor}
        usingMobileLayout={usingMobileLayout}
        usingMobileLayoutRef={usingMobileLayoutRef}
        overtimeMultiplierCursor={overtimeMultiplierCursor}
        customClasses={inputsSectionCustomClasses}
        preferredLanguageDescriptionRef={preferredLanguageDescriptionRef}
        languagesListRef={languagesListRef}
        threeInputsFieldSetRef={threeInputsFieldSetRef}
      />

      <DayPreviewComponent
        dayPreviewRef={dayPreviewRef}
        exampleDayNameElementRef={exampleDayNameElementRef}
        dayNameColor={[0, 0, 1]}
        dayString={exampleDayName}
        firstRowWrapperRef={previewDayComponentFirstRowWrapperRef}
        customClasses={{ previewContainerOther }}
      />

      <AutosaveSection
        interval={[15, 120]}
        units={seconds}
        selectedMobileMenu={selectedMobileMenu}
        autosaveSectionRef={autosaveSectionRef}
        scrollableAreaRef={scrollableAreaRef}
      />

      <>
        <ExplanationsSection
          selectedMobileMenu={
            usingMobileLayout ? selectedMobileMenu : "general"
          }
          explanationsSectionRef={explanationsSectionRef}
        />
        {weekdaysMondayFirst.map((weekday, i) => (
          <ApplicationDaySettings
            key={i}
            dayName={weekday}
            englishDayName={englishWeekdaysMondayFirst[i]}
            footerRef={footerRef}
            headerRef={headerRef}
            usingMobileLayout={usingMobileLayout}
            cursor={weekdaysCursors[englishWeekdaysMondayFirst[i]]}
            closeLastOpenedModalRef={closeLastOpenedModalRef}
            applicationSettingsContainerRef={applicationSettingsContainerRef}
            selectedMobileMenu={selectedMobileMenu}
            previewDayComponentFirstRowWrapperRef={
              previewDayComponentFirstRowWrapperRef
            }
            setExampleDayName={setExampleDayName}
            exampleDayName={exampleDayName}
            setExampleDayColor={changeExampleDayNameElementColorRef.current}
            scrollableAreaRef={scrollableAreaRef}
            applicationDaySettingsBarRef={
              applicationDaySettingsBarsRefsRef.current[i]
            }
            defaultColorButtonRef={defaultColorButtonsRefsRef.current[i]}
            colorPickerRef={colorPickersRefsRef.current[i]}
          />
        ))}
      </>
    </section>
  );
};
