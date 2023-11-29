import { useEffect, useRef, useState } from "react";
import { getRateLimitedFunction } from "../../../../functions/getRateLimitedFunction";
import { apiSlice } from "../../../../slices/apiSlice";
import { applicationSettingChanged } from "../../../../slices/applicationSettingsSlice";
import { store, useAppDispatch, useAppSelector } from "../../../../store";
import { userDefaultsBlankResponse } from "../../../../utils/transformUserSettings";
import { Slider } from "../../Slider/Slider";
import {
  autoSaveContainer,
  autoSaveDescription,
  sliderWrapper,
  horizontalDivider,
  autoSaveSection,
  hideOnMobile,
} from "./AutosaveSection.module.css";

interface IProps {
  interval: [number, number];
  units: string;
  selectedMobileMenu: "general" | "days" | "colors";
  autosaveSectionRef: React.MutableRefObject<HTMLFieldSetElement | null>;
  scrollableAreaRef: React.MutableRefObject<HTMLDivElement | null>;
}

const getInitialState = () => {
  const { autosaveInterval } = store.getState().main;

  return autosaveInterval.data ?? 30;
};

export const AutosaveSection = ({
  interval,
  units,
  selectedMobileMenu,
  autosaveSectionRef,
  scrollableAreaRef,
}: IProps) => {
  const languageObject = useAppSelector(
    (state) => state.applicationSettings.languageObject,
  );

  const dispatch = useAppDispatch();

  const [autosaveInterval, setAutosaveInterval] = useState(getInitialState);

  // useEffect(() => {
  //   const initialState = getInitialState();
  //   setAutosaveInterval(initialState);
  // }, [selectedMobileMenu]);

  const setAutosaveIntervalRef = useRef((autosaveInterval: number) => {
    dispatch(
      applicationSettingChanged({
        property: "autosaveInterval",
        value: autosaveInterval,
      }),
    );
  });

  const rateLimitedSetAutosaveIntervalRef = useRef(
    getRateLimitedFunction(setAutosaveIntervalRef.current, 500, true, 20),
  );

  useEffect(() => {
    rateLimitedSetAutosaveIntervalRef.current(autosaveInterval);
  }, [autosaveInterval]);

  const { autosaveInterval: autosaveIntervalLocalizedString } =
    languageObject.data;
  const mobileVisibility = selectedMobileMenu !== "general" ? hideOnMobile : "";

  return (
    <fieldset
      className={`${autoSaveSection} ${mobileVisibility}`}
      ref={autosaveSectionRef}
    >
      <hr className={horizontalDivider}></hr>
      <div className={autoSaveContainer}>
        <legend id="autosaveLabel" className={autoSaveDescription}>
          {autosaveIntervalLocalizedString}
        </legend>
        <div className={sliderWrapper}>
          <Slider
            value={autosaveInterval}
            setValue={setAutosaveInterval}
            interval={interval}
            units={units}
            scrollableAreaRef={scrollableAreaRef}
          />
        </div>
      </div>
      <div className={horizontalDivider}></div>
    </fieldset>
  );
};
