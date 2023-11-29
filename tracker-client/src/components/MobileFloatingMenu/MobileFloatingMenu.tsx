import {
  mobileFloatingMenuComponent,
  scrollUpButton,
  saveButton,
  loadButton,
  downloadButton,
  optionsContainer,
  upChevronIcon as upChevronIconClass,
  scrollUpButtonContainer,
  optionButtonsContainer,
  buttonsDivider,
} from "./MobileFloatingMenu.module.css";

import upChevronIcon from "./assets/upChevronIcon.svg";
import { defaultButton } from "../../sharedStyles.module.css";
import { store, useAppSelector } from "../../store";
import { saveDatesInLongTermStorage } from "../../functions/saveDatesInLongTermStorage";

interface IProps {
  showOptions: boolean;
  setShowImpex: React.Dispatch<React.SetStateAction<boolean | 2>>;
}

const handleScrollToTopButton = () => {
  // console.log("scrolling top");
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

export const MobileFloatingMenu = ({ showOptions, setShowImpex }: IProps) => {
  const { load, download, save } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const handleImpexClick = () => {
    setShowImpex(true);
  };

  const saveDates = () => {
    const { dates } = store.getState().main;
    if (dates.data) saveDatesInLongTermStorage(dates.data, true);
  };

  return showOptions ? (
    <div className={mobileFloatingMenuComponent}>
      {/* <div className={`${defaultButton} ${scrollUpButtonContainer}`}>
        <div className={scrollUpButton}>
          <img src={upChevronIcon} className={upChevronIconClass} />
        </div>
      </div> */}
      <div className={optionsContainer}>
        {/* {showOptions ? ( */}
        <div className={optionButtonsContainer}>
          {/* <div className={`${defaultButton} ${loadButton}`}>{load}</div>
          <div className={buttonsDivider}></div> */}
          <button
            onClick={handleImpexClick}
            className={`${defaultButton} ${downloadButton}`}
          >{`${load} & ${download}`}</button>
          <div className={buttonsDivider}></div>
          <button
            onClick={saveDates}
            className={`${defaultButton} ${saveButton}`}
          >
            {save}
          </button>
        </div>
        <button
          onClick={handleScrollToTopButton}
          className={`${defaultButton} ${scrollUpButtonContainer}`}
        >
          <div className={scrollUpButton}>
            <img src={upChevronIcon} className={upChevronIconClass} alt="" />
          </div>
        </button>

        {/* ) : null} */}
        {/* <div
          onClick={handleCloseMenu}
          className={`${defaultButton} ${optionsButton}`}
        >
          <div
            className={`${optionsButtonPlus} ${showOptions ? rotatedPlus : ""}`}
          >
            +
          </div>
        </div> */}
      </div>
    </div>
  ) : null;
};
