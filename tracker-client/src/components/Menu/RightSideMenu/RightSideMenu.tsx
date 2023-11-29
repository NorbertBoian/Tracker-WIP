import { getCombinedMonthSettings } from "../../../functions/getCombinedMonthSettings";
import { getCustomMonthSettings } from "../../../functions/getCustomMonthSettings";
import { getDefaultMonthSettings } from "../../../functions/getDefaultMonthSettings";
import { saveDatesInLongTermStorage } from "../../../functions/saveDatesInLongTermStorage";
import { defaultButton } from "../../../sharedStyles.module.css";
import { apiSlice } from "../../../slices/apiSlice";
import { store, useAppSelector } from "../../../store";
import { getEnabledDays } from "../../Month/functions/getEnabledDays";
import {
  downloadButton,
  loadButton,
  saveButton,
  saveStatusContainer,
  saveStatusDot,
  saveStatusText,
  saveStatusDotWrapper,
  savedClass,
  loggedInLoadButton,
  loggedInDownloadButton,
  loggedInSaveButton,
  loggedInSaveStatusContainer,
  notSavedClass,
} from "./RightSideMenu.module.css";

const saveDates = () => {
  const { dates } = store.getState().main;
  if (dates.data) saveDatesInLongTermStorage(dates.data, true);
};

interface IProps {
  loggedIn: boolean;
  setShowImpex: React.Dispatch<React.SetStateAction<boolean | 2>>;
}

export const RightSideMenu = ({ loggedIn, setShowImpex }: IProps) => {
  const { load, download, save, saved, notSaved } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const savedStatus = useAppSelector((state) => state.main.savedStatus);

  const handleImpex = () => {
    setShowImpex(true);
  };

  return (
    <>
      <button
        type="button"
        className={`${defaultButton} ${loadButton} ${
          loggedIn ? loggedInLoadButton : ""
        }`}
        onClick={handleImpex}
      >
        {load}
      </button>
      <button
        type="button"
        onClick={handleImpex}
        className={`${defaultButton} ${downloadButton} ${
          loggedIn ? loggedInDownloadButton : ""
        }`}
      >
        {download}
      </button>
      <button
        type="button"
        onClick={saveDates}
        className={`${defaultButton} ${saveButton} ${
          loggedIn ? loggedInSaveButton : ""
        }`}
      >
        {save}
      </button>
      <div
        className={`${saveStatusContainer} ${
          savedStatus ? savedClass : notSavedClass
        } ${loggedIn ? loggedInSaveStatusContainer : ""}`}
      >
        <div className={saveStatusText}>{savedStatus ? saved : notSaved}</div>
        <div className={saveStatusDotWrapper}>
          <div className={saveStatusDot}></div>
        </div>
      </div>
    </>
  );
};
