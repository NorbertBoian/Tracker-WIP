/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
import {
  ChangeEvent,
  DragEvent,
  useEffect,
  useRef,
  useState,
  KeyboardEvent as ReactKeyboardEvent,
  AnimationEvent,
  MouseEvent as ReactMouseEvent,
} from "react";
import {
  englishWeekdaysArray,
  englishWeekdayType,
  languageCodeType,
  monthNumberType,
} from "../../constants/constants";
import { getCombinedMonthSettings } from "../../functions/getCombinedMonthSettings";
import { getRateLimitedFunction } from "../../functions/getRateLimitedFunction";
import { getMonthCustomSettings } from "../../hooks/useMonthCustomSettings";
import { getMonthDefaultSettings } from "../../hooks/useMonthDefaultSettings";
import { useStateRef } from "../../hooks/useStateRef";
import { apiSlice, useGetSpreadsheetMutation } from "../../slices/apiSlice";

import {
  fileInput,
  impexDialog,
  closeButton,
  exportHeading,
  exportMonthLabel,
  progressStatus,
  sheetLabel,
  sheetButton,
  jsonDownloadLabel,
  downloadButton,
  importSection,
  importHeading,
  importFileElement,
  header,
  importToLabel,
  exportSection,
  importButton,
  importYearSelectWrapper,
  importMonthSelectWrapper,
  exportYearSelectWrapper,
  exportMonthSelectWrapper,
  exportSelects,
  importSelects,
  sheetFieldset,
  jsonFieldset,
  exportFieldsets,
  selectedFileName,
  chooseFileButton,
  monthSettingsImportLabel,
  dragging as draggingClass,
  droppableArea,
  monthSettingsImportFieldset,
  dragInBox,
  successfullMessage,
  sheetReady,
  footer,
  mounted,
  container,
  focused,
  monthSettingsImportCheckbox,
  unmounted,
  inAnimation,
} from "./Impex.module.css";

import selectCustomClasses from "./Select.module.css";
import {
  disabledDaysType,
  requiredHoursType,
} from "../../slices/apiSliceTypes";
import { yearOrMonthChanged } from "../../slices/mainSlice/mainSlice";
import { store, useAppDispatch, useAppSelector } from "../../store";
import { IDate } from "../../utils/getEmptyDatesArray";
import { getLocalStorageItem } from "../../utils/typedLocalStorage/typedLocalStorage";
import { getEnabledDays } from "../Month/functions/getEnabledDays";
import { Select } from "../Menu/MiddleMenu/Select/Select";
import { defaultButton } from "../../sharedStyles.module.css";
import { useAnimation } from "../../hooks/useAnimation";
import { useCloseOverlay } from "../../hooks/useCloseOverlay";
import { useFocusOutline } from "../../hooks/useFocusOutline";

type jsonDataType = {
  month: monthNumberType;
  year: number;
  enabledDays: IDate[];
  monthSettings: {
    monthlyHourlyRate: string;
    monthlyOvertimeMultiplier: string;
    monthlyRequiredHours: requiredHoursType;
    monthlyDisabledDays: disabledDaysType;
  };
  languageCode: languageCodeType;
  displayedCurrency: string;
  dayColors: {
    [key in englishWeekdayType]: [number, number, number];
  };
};

const progressStrings = {
  uninitialized: "Uninitialized",
  searchFolder: "Searching folder",
  createFolder: "Creating folder",
  createSheet: "Creating spreadsheet",
  moveSheet: "Moving spreadsheet",
  getLink: "Getting link",
  searchFile: "Searching file",
  updateSpreadsheet: "Updating spreadsheet",
  permissions: "Setting permissions",
  clearSheet: "Clearing ranges",
  initialUpdates: "Initial updates",
  createScript: "Creating script",
  updateScript: "Updating script",
  finished: "Finished",
  noData: "No data",
  aborted: "Aborting prev. req.",
  initializing: "Initializing",
};

const getExportData = async () => {
  const {
    dates,
    languageCode,
    displayedCurrency,
    streamClientId,
    applicationSettings,
  } = store.getState().main;

  const presentDates = dates.data;
  const monthDefaultSettings = await getMonthDefaultSettings();
  const monthCustomSettings = await getMonthCustomSettings();

  const combinedMonthSettings = getCombinedMonthSettings(
    monthCustomSettings,
    monthDefaultSettings,
  );

  const displayedCurrencyData = displayedCurrency.data;

  const applicationSettingsData = applicationSettings.data;
  const languageCodeData = languageCode.data;

  if (
    combinedMonthSettings &&
    displayedCurrencyData &&
    presentDates &&
    applicationSettingsData &&
    languageCodeData
  ) {
    const enabledDays = getEnabledDays(
      presentDates,
      combinedMonthSettings.monthlyDisabledDays,
    );

    const dayColors = {} as {
      [weekday in englishWeekdayType]: [number, number, number];
    };

    for (const weekday of englishWeekdaysArray) {
      Object.assign(dayColors, {
        [weekday]: applicationSettingsData.weekdays[weekday].color,
      });
    }
    return {
      combinedMonthSettings,
      enabledDays,
      dayColors,
      displayedCurrencyData,
      languageCodeData,
      streamClientId,
    };
  } else return undefined;
};

const currentYear = new Date().getFullYear();

const years = Array.from({ length: currentYear - 1999 }, (v, index) =>
  (currentYear - index).toString(),
);

type Props = {
  handleImpexBackdropMouseDownRef: React.MutableRefObject<
    (event: MouseEvent | ReactMouseEvent<Element, MouseEvent>) => void
  >;
  setShowImpex: React.Dispatch<React.SetStateAction<boolean | 2>>;
  closeLastOpenedModalRef: React.MutableRefObject<(() => void)[]>;
};

export const Impex = ({
  setShowImpex,
  closeLastOpenedModalRef,
  handleImpexBackdropMouseDownRef,
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    closeLastOpenedModalRef.current = [
      ...closeLastOpenedModalRef.current,
      () => setShowImpex(false),
    ];
    return () => {
      closeLastOpenedModalRef.current = closeLastOpenedModalRef.current.slice(
        0,
        -1,
      );
    };
  }, [closeLastOpenedModalRef, setShowImpex]);

  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (dialogElement) {
      dialogElement.showModal();
      return () => {
        dialogElement.close();
      };
    }
  }, []);

  const [jsonURL, setJsonUrl, jsonURLRef] = useStateRef<string>("");

  const getAvailableYears = () => {
    const years = getLocalStorageItem("years");
    return years ? Object.keys(years) : undefined;
  };

  const { monthsArray } = useAppSelector(
    (state) => state.main.languageObject.data,
  );

  const [link, setLink] = useState("#");
  const [progress, setProgress] =
    useState<keyof typeof progressStrings>("uninitialized");

  const controllerRef = useRef(new AbortController());

  const getSheetRef = useRef(async () => {
    const { year, month } = store.getState().main;
    const exportData = await getExportData();

    if (exportData) {
      const {
        combinedMonthSettings,
        enabledDays,
        dayColors,
        displayedCurrencyData,
        languageCodeData,
        streamClientId,
      } = exportData;

      const {
        monthlyHourlyRate,
        monthlyOvertimeMultiplier,
        monthlyRequiredHours,
        monthlyDisabledDays,
      } = combinedMonthSettings;

      const result = {
        month,
        year,
        enabledDays,
        monthSettings: combinedMonthSettings,
        languageCode: languageCodeData,
        displayedCurrency: displayedCurrencyData,
        dayColors,
      };

      setJsonUrl(
        URL.createObjectURL(
          new Blob([JSON.stringify(result, null, 2)], {
            type: "application/json",
          }),
        ),
      );

      const apiURL = `https://${import.meta.env.VITE_SERVER_URL}`;

      const request = fetch(`${apiURL}/getspreadsheet`, {
        method: "post",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controllerRef.current.signal,
        body: JSON.stringify({
          hourlyRate: monthlyHourlyRate,
          overtimeMultiplier: monthlyOvertimeMultiplier,
          displayedCurrency: displayedCurrencyData,
          preferredLanguage: languageCodeData,
          month,
          year,
          requiredHours: monthlyRequiredHours,
          disabledDays: monthlyDisabledDays,
          weekdaysColors: dayColors,
          filteredDates: enabledDays,
          streamClientId,
        }),
      });

      try {
        const response = await request;
        const parsed = await response.json();
        setLink(parsed);
      } catch {
        //
      }
    } else {
      setProgress("noData");
    }
  });

  const rateLimitedGetSheetRef = useRef(
    getRateLimitedFunction(getSheetRef.current, 50, false),
  );

  const year = useAppSelector((state) => state.main.year);
  const month = useAppSelector((state) => state.main.month);
  const applicationSettings = useAppSelector(
    (state) => state.main.applicationSettings,
  );
  const monthSettings = useAppSelector((state) => state.main.monthSettings);
  const dates = useAppSelector((state) => state.main.dates);
  const [success, setSuccess] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const { streamClientId } = store.getState().main;
    const events = new EventSource(
      `https://${
        import.meta.env.VITE_SERVER_URL
      }/spreadsheetprogress?s=${streamClientId}`,
    );

    events.onmessage = (event) => {
      setProgress(event.data);
    };
    return () => {
      events.close();
    };
  }, []);

  useEffect(() => {
    const controller = controllerRef.current;
    const jsonURL = jsonURLRef.current;
    rateLimitedGetSheetRef.current();
    return () => {
      URL.revokeObjectURL(jsonURL);
      controller.abort();
      setProgress((progress) =>
        progress !== "finished" && progress !== "initializing"
          ? "aborted"
          : "initializing",
      );
      controllerRef.current = new AbortController();
    };
  }, [applicationSettings, monthSettings, dates, jsonURLRef]);

  const availableYears = getAvailableYears() ?? [`${year}`];
  const [selectedImportYear, setSelectedImportYear] = useState(`${year}`);
  const [selectedImportMonth, setSelectedImportMonth] = useState(month);

  const [checkbox, setCheckbox] = useState(false);

  const onCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCheckbox(event.target.checked);
  };

  const handleImportMonthChange = (
    monthLocalizedName: string,
    index: number,
  ) => {
    setSelectedImportMonth(index as monthNumberType);
    setSuccess(false);
  };

  const handleImportYearChange = (year: string) => {
    setSelectedImportYear(year);
    setSuccess(false);
  };

  const setYearRef = useRef((year: string) => {
    dispatch(yearOrMonthChanged({ year: +year }));
  });

  const setMonthRef = useRef((monthLocalizedName: string, index: number) => {
    dispatch(yearOrMonthChanged({ month: index as monthNumberType }));
  });

  const [importData, setImportData] = useState<jsonDataType | undefined>(
    undefined,
  );

  const [fileName, setFileName] = useState("");

  const handleFile = (file: File | undefined) => {
    setFileName(file?.name ?? "");
    if (file) readFile(file);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (progressEvent) => {
      const string = progressEvent.target?.result;
      if (typeof string === "string") {
        const importData = JSON.parse(string);
        setImportData(importData);
      }
    };
  };

  const handleImportData = (
    importData?: jsonDataType,
    month?: monthNumberType,
    year?: string | number,
    importMonthSettings = true,
  ) => {
    setSuccess(true);
    //
  };

  const [dragging, setDragging] = useState(false);
  const [dragIsInDroppableArea, setDragIsInDroppableArea] = useState(false);
  const droppableAreaRef = useRef<HTMLDivElement>(null);

  const onDragEnter = (event: DragEvent<HTMLDialogElement>) => {
    if (event.target === droppableAreaRef.current) {
      setDragIsInDroppableArea(true);
    }
    setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLDialogElement>) => {
    if (event.target === droppableAreaRef.current) {
      setDragIsInDroppableArea(false);
    }
    if (event.relatedTarget === null) {
      setDragIsInDroppableArea(false);
      setDragging(false);
    }
  };

  const exportMonthSelectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // exportMonthSelectInputRef.current?.focus();
    const dialogElement = dialogRef.current;
    return () => {
      dialogElement?.close();
    };
  }, []);

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setSuccess(false);
    setDragging(false);
    setDragIsInDroppableArea(false);
    const file = event.dataTransfer?.files[0];
    handleFile(file);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const { render, onAnimationEnd } = useAnimation(success);

  const handleImportClick = () => {
    handleImportData(importData, month, year, checkbox);
  };

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (event.animationName === inAnimation) {
      setTimeout(() => {
        setSuccess(false);
      }, 1000);
    }
    onAnimationEnd();
  };

  const handleCloseButtonClick = () => {
    setShowImpex(false);
  };

  const handleBackdropMouseDown = (
    event: ReactMouseEvent<HTMLDialogElement>,
  ) => {
    if (event.target === event.currentTarget)
      handleImpexBackdropMouseDownRef.current(event);
  };

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);

  const handleCloseButtonShiftTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        importButtonRef.current?.focus();
      }
    },
  );

  const handleImportButtonTabRef = useRef(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    },
  );

  const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
    undefined,
  );

  const exportSectionRef = useRef<HTMLElement>(null);

  const onMouseDownRef = useRef((event: ReactMouseEvent<HTMLDivElement>) => {
    if (
      event.target === event.currentTarget ||
      event.target === exportSectionRef.current
    )
      priorityFocusedElementRef.current = closeButtonRef.current;
  });

  const handleTabAfterWhitespaceClickRef = useRef((event: KeyboardEvent) => {
    if (
      document.activeElement === document.body &&
      priorityFocusedElementRef.current &&
      event.key === "Tab"
    ) {
      priorityFocusedElementRef.current.focus();
      event.preventDefault();
      priorityFocusedElementRef.current = undefined;
    }
  });

  useEffect(() => {
    const handleTabAfterWhitespaceClick =
      handleTabAfterWhitespaceClickRef.current;
    window.document.body.addEventListener(
      "keydown",
      handleTabAfterWhitespaceClick,
    );

    return () => {
      window.document.body.removeEventListener(
        "keydown",
        handleTabAfterWhitespaceClick,
      );
    };
  }, []);

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  return (
    <dialog
      className={impexDialog}
      ref={dialogRef}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        className={container}
        onMouseDown={onMouseDownRef.current}
        role="presentation"
      >
        <section className={exportSection} ref={exportSectionRef}>
          <header className={header}>
            <h1 className={exportHeading}>Export</h1>
            <div className={exportMonthLabel}>From</div>
            <button
              onKeyDown={handleCloseButtonShiftTabRef.current}
              ref={closeButtonRef}
              className={`${defaultButton} ${closeButton}`}
              onClick={handleCloseButtonClick}
            >
              Close
            </button>
          </header>
          <div className={exportSelects}>
            <div className={exportMonthSelectWrapper}>
              <Select
                selectInputRef={exportMonthSelectInputRef}
                valueSetter={setMonthRef.current}
                name="exportMonth"
                value={`${monthsArray[month]}`}
                options={monthsArray}
                customClasses={selectCustomClasses}
              />
            </div>
            <div className={exportYearSelectWrapper}>
              <Select
                valueSetter={setYearRef.current}
                name="exportYear"
                value={`${year}`}
                options={availableYears}
                reversedArrows={true}
                customClasses={selectCustomClasses}
              />
            </div>
          </div>

          <div className={exportFieldsets}>
            <fieldset className={sheetFieldset}>
              <div className={sheetLabel}>Google Sheets</div>
              <a
                className={`${sheetButton} ${
                  progress === "finished" ? sheetReady : ""
                }`}
                href={`${link}`}
                target="_blank"
                rel="noreferrer"
                tabIndex={progress === "finished" ? 0 : -1}
              >
                {progress === "finished" ? "Open" : progressStrings[progress]}
              </a>
            </fieldset>
            <fieldset className={jsonFieldset}>
              <div className={jsonDownloadLabel}>JSON</div>
              <a
                className={downloadButton}
                download={`${monthsArray[month]} ${year}`}
                href={jsonURL}
              >
                Download
              </a>
            </fieldset>
          </div>
        </section>
        <form className={importSection}>
          <h1 className={importHeading}>Import JSON</h1>
          <div className={`${droppableArea} ${dragging ? draggingClass : ""}`}>
            <div className={importToLabel}>Into </div>

            <div className={importSelects}>
              <div className={importMonthSelectWrapper}>
                <Select
                  valueSetter={handleImportMonthChange}
                  name="importMonth"
                  value={`${monthsArray[selectedImportMonth]}`}
                  options={monthsArray}
                  customClasses={selectCustomClasses}
                />
              </div>
              <div className={importYearSelectWrapper}>
                <Select
                  valueSetter={setSelectedImportYear}
                  name="importYear"
                  value={`${selectedImportYear}`}
                  options={years}
                  reversedArrows={true}
                  customClasses={selectCustomClasses}
                />
              </div>
            </div>

            <input
              className={fileInput}
              type="file"
              id="file"
              accept=".json"
              onChange={onFileChange}
            />
            <label
              role="button"
              className={importFileElement}
              htmlFor="file"
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <div className={selectedFileName}>
                {fileName ? fileName : "No file selected"}
              </div>
              <div
                className={`${chooseFileButton} ${
                  dragIsInDroppableArea ? dragInBox : ""
                }`}
                ref={droppableAreaRef}
              >
                {dragging ? "Drop JSON here" : "Choose"}
              </div>
            </label>
            <fieldset
              className={`${monthSettingsImportFieldset} ${
                inputisFocused ? focused : ""
              }`}
            >
              <input
                checked={checkbox}
                onChange={onCheckboxChange}
                type="checkbox"
                id="monthSettingsImport"
                onMouseDown={onInputMouseDownRef.current}
                onFocus={onInputFocusRef.current}
                onBlur={onInputBlurRef.current}
                className={monthSettingsImportCheckbox}
              />
              <label
                htmlFor="monthSettingsImport"
                className={monthSettingsImportLabel}
                onMouseDown={onInputMouseDownRef.current}
              >
                Import month settings
              </label>
            </fieldset>
            <footer className={footer}>
              {render ? (
                <div
                  onAnimationEnd={handleAnimationEnd}
                  className={`${successfullMessage} ${
                    success ? mounted : unmounted
                  }`}
                >
                  Import successfull!
                </div>
              ) : null}
              <button
                onKeyDown={handleImportButtonTabRef.current}
                ref={importButtonRef}
                type="button"
                className={`${defaultButton} ${importButton}`}
                onClick={handleImportClick}
              >
                Import
              </button>
            </footer>
          </div>
        </form>
      </div>
    </dialog>
  );
};
