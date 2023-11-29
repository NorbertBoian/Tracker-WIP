import {
  firstRow,
  monthName,
  closeButton,
} from "./MonthSettingsHeader.module.css";
import { defaultButton } from "../../../sharedStyles.module.css";
import { useAppSelector } from "../../../store";
import { RefObject, KeyboardEvent, MouseEvent } from "react";

interface IProps {
  setShowMonthSettings: (boolean: boolean) => void;
  headerRef: React.RefObject<HTMLElement>;
  closeButtonRef: RefObject<HTMLButtonElement>;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
}

export const MonthSettingsHeader = ({
  closeButtonRef,
  onKeyDown,
  setShowMonthSettings,
  headerRef,
  onMouseDown,
}: IProps) => {
  const { close, monthsArray } = useAppSelector(
    (state) => state.main.languageObject.data,
  );
  const month = useAppSelector((state) => state.main.month);
  const year = useAppSelector((state) => state.main.year);

  const handleCloseButtonClick = () => {
    setShowMonthSettings(false);
  };

  return (
    <header
      className={firstRow}
      ref={headerRef}
      onMouseDown={onMouseDown}
      role="presentation"
    >
      <h1
        className={monthName}
        onMouseDown={onMouseDown}
        role="presentation"
      >{`${monthsArray[month]} ${year}`}</h1>
      <button
        ref={closeButtonRef}
        onKeyDown={onKeyDown}
        type="button"
        onClick={handleCloseButtonClick}
        className={`${defaultButton} ${closeButton}`}
      >
        {close}
      </button>
    </header>
  );
};
