import { defaultButton } from "../../../sharedStyles.module.css";
import { Select } from "./Select/Select";
import cogWheelIcon from "./assets/cogWheelIcon.svg";
import {
  monthSettingsButtonSmall,
  monthSettingsButtonLarge,
  clearInputsButton,
  lockInputsButton,
  toggleStatsButton,
  monthSelectWrapper,
  yearSelectWrapper,
  unlockInputsButton,
  toggleInputsButton,
  loggedInMonthSettingsSmallButtonWrapper,
  loggedInClearInputsButton,
  loggedInMonthSelectWrapper,
  loggedInYearSelectWrapper,
  hidden,
  monthSettingsSmallButtonWrapper,
} from "./MiddleMenu.module.css";
import {
  showDaysStatsToggled,
  yearOrMonthChanged,
} from "../../../slices/mainSlice/mainSlice";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getCreateNotification } from "../../../functions/createNotification/createNotification";
import {
  createPrompt,
  getCreatePrompt,
} from "../../../functions/createPrompt/createPrompt";
import { monthNumberType } from "../../../constants/constants";
import { toggleInputDisabled } from "../../../functions/toggleInputDisabled";
import { clearInputs } from "../../../functions/clearInputs";
import { useCallback, useRef } from "react";

interface IProps {
  loggedIn: boolean;
  setShowMonthSettings: React.Dispatch<React.SetStateAction<boolean | 2>>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
}

const currentYear = new Date().getFullYear();

const years = Array.from({ length: currentYear - 1999 }, (v, index) =>
  (currentYear - index).toString(),
);

const createClearNotification = getCreateNotification(
  "Cleared inputs.",
  "clearInputs",
);

const onClearInputs = () => {
  clearInputs();
  createClearNotification();
};

export const MiddleMenu = ({
  loggedIn,
  setShowMonthSettings,
  closeLastOpenedModalRef,
}: IProps) => {
  const {
    monthSettings,
    clearInputs: clearInputsLocalizedString,
    toggleStats,
    lockInputs,
    unlockInputs,
    monthsArray,
  } = useAppSelector((state) => state.main.languageObject.data);

  const year = useAppSelector((state) => state.main.year);
  const month = useAppSelector((state) => state.main.month);
  const lockedInputs = useAppSelector((state) => state.main.lockedInputs);

  const monthString = monthsArray[month];

  const handleMonthSettingsButtonsClickRef = useRef(() => {
    setShowMonthSettings((showMonthSettings) => !showMonthSettings);
  });

  const dispatch = useAppDispatch();

  const setYearRef = useRef((year: string) => {
    dispatch(yearOrMonthChanged({ year: +year }));
  });

  const setMonthRef = useRef((monthLocalizedName: string, index: number) => {
    dispatch(yearOrMonthChanged({ month: index as monthNumberType }));
  });

  const onToggleShowDaysStatsRef = useRef(() => {
    dispatch(showDaysStatsToggled());
  });

  const longestLockInputsButtonString =
    lockInputs.length > unlockInputs.length ? lockInputs : unlockInputs;

  const createClearInputsPrompt = useCallback(
    () =>
      createPrompt(
        "Are you sure you want to clear inputs?",
        onClearInputs,
        closeLastOpenedModalRef,
      ),
    [closeLastOpenedModalRef],
  );

  return (
    <>
      <button
        onClick={handleMonthSettingsButtonsClickRef.current}
        aria-label={monthSettings}
        className={`${monthSettingsSmallButtonWrapper} ${
          loggedIn ? loggedInMonthSettingsSmallButtonWrapper : ""
        }`}
      >
        <img
          className={`${defaultButton} ${monthSettingsButtonSmall}`}
          alt=""
          src={cogWheelIcon}
        />
      </button>
      <button
        type="button"
        onClick={handleMonthSettingsButtonsClickRef.current}
        className={`${defaultButton} ${monthSettingsButtonLarge}`}
      >
        {monthSettings}
      </button>
      <div
        className={`${monthSelectWrapper} ${
          loggedIn ? loggedInMonthSelectWrapper : ""
        }`}
      >
        <Select
          valueSetter={setMonthRef.current}
          name="month"
          value={monthString}
          options={monthsArray}
        />
      </div>
      <div
        className={`${yearSelectWrapper} ${
          loggedIn ? loggedInYearSelectWrapper : ""
        }`}
      >
        <Select
          valueSetter={setYearRef.current}
          name="year"
          value={`${year}`}
          options={years}
          reversedArrows={true}
        />
      </div>
      <button
        type="button"
        onClick={createClearInputsPrompt}
        disabled={!!lockedInputs.data}
        className={`${defaultButton} ${clearInputsButton} ${
          loggedIn ? loggedInClearInputsButton : ""
        }`}
      >
        {clearInputsLocalizedString}
      </button>
      <button
        type="button"
        onClick={toggleInputDisabled}
        className={`${defaultButton} ${toggleInputsButton} ${
          lockedInputs.data ? unlockInputsButton : lockInputsButton
        }`}
      >
        <div className={hidden}>{longestLockInputsButtonString}</div>
        <div>{lockedInputs.data ? unlockInputs : lockInputs}</div>
      </button>
      <button
        type="button"
        onClick={onToggleShowDaysStatsRef.current}
        className={`${defaultButton} ${toggleStatsButton}`}
      >
        {toggleStats}
      </button>
    </>
  );
};
