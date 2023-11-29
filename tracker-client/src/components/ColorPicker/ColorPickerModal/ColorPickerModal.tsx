/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useRef, useState, KeyboardEvent, MouseEvent } from "react";
import { emptyObject } from "../../../constants/constants";
import { useCloseOverlay } from "../../../hooks/useCloseOverlay";
import { languageObjectType } from "../../../languages/en";
import { blackOverlay, defaultButton } from "../../../sharedStyles.module.css";
import { getDayPreviewComponentType } from "../../ApplicationSettings/ApplicationDaySettings/ApplicationDaySettings";
import { getColorPickerOverlayPositionType } from "../../ApplicationSettings/ApplicationDaySettings/functions/getColorPickerOverlayPositionCreator";
import { getShouldShowAsModalType } from "../../ApplicationSettings/ApplicationDaySettings/functions/getShouldShowAsModalCreator";
import { ColorPickerBar } from "../ColorPickerBar/ColorPickerBar";
import {
  ColorPickerOverlay,
  customClasssesType as ColorPickerOverlayCustomClasssesType,
} from "../ColorPickerOverlay/ColorPickerOverlay";

import defaultClasses from "./ColorPickerModal.module.css";
export type customClasssesType = Partial<typeof defaultClasses>;

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface IProps {
  colorPreviewRef: React.MutableRefObject<HTMLDivElement | null>;
  setHsvColor: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  hsvColor: [number, number, number];
  // viewportHeight: number;
  // viewportWidth: number;
  setShowColorPickerOverlayAsModal: React.Dispatch<
    React.SetStateAction<boolean | undefined>
  >;
  showColorPickerOverlayAsModal: boolean | undefined;
  showOverlay: boolean | 2;
  label: string;
  showingColorPickerOverlayAsModalRef: React.MutableRefObject<
    boolean | undefined
  >;
  colorPickerOverlayMountCallback?: (
    setShowColorPickerOverlay: (boolean: boolean) => void,
  ) => void;
  colorPickerOverlayUnmountCallback?: typeof noop;
  getShouldShowAsModal: getShouldShowAsModalType;
  getColorPickerOverlayPosition: getColorPickerOverlayPositionType;
  setShowOverlayAndResetShowModal: React.Dispatch<
    React.SetStateAction<boolean | 2>
  >;
  colorPickerOverlayCustomClasses?: ColorPickerOverlayCustomClasssesType;
  getPreviewInModalComponent: getDayPreviewComponentType | typeof noop;
  languageObject: languageObjectType;
  id: string;
  priorityFocusedElementRef: React.MutableRefObject<
    HTMLElement | null | undefined
  >;
  rerenderOverlay: never[];
  showOverlayRef: React.MutableRefObject<boolean | 2>;
  customClasses?: Partial<typeof defaultClasses>;
  scrollableAreaRef?: React.MutableRefObject<HTMLDivElement | null>;
}

export const ColorPickerModal = ({
  colorPreviewRef,
  setHsvColor,
  rerenderOverlay,
  hsvColor,
  setShowColorPickerOverlayAsModal,
  showingColorPickerOverlayAsModalRef,
  colorPickerOverlayMountCallback = noop,
  colorPickerOverlayUnmountCallback = noop,
  getShouldShowAsModal = () => true,
  getColorPickerOverlayPosition = () => false,
  setShowOverlayAndResetShowModal,
  colorPickerOverlayCustomClasses = emptyObject,
  getPreviewInModalComponent = () => null,
  scrollableAreaRef,
  id,
  label,
  priorityFocusedElementRef,
  showColorPickerOverlayAsModal,
  showOverlay,
  languageObject,
  showOverlayRef,
  debug,
  customClasses = emptyObject,
}: IProps) => {
  const [localHsvColor, setLocalHsvColor] = useState(hsvColor);

  const combinedClasses = { ...defaultClasses, ...customClasses };
  const {
    colorPickerModal,
    colorPickerOverlayContainerPosition,
    closeButton,
    footer,
    okButton,
    sliderAndMainGradientContainerBackground,
    hexInputBackgroundColor,
    colorPreviewColoredRectangleBorderColor,
    scrollableArea,
  } = combinedClasses;

  const colorPickerBarCustomClassesModal = {
    hexInputBackgroundColor,
    colorPreviewColoredRectangleBorderColor,
  };

  const colorPickerOverlayCustomClassesModal = {
    ...colorPickerOverlayCustomClasses,
    colorPickerOverlayContainerPosition,
    sliderAndMainGradientContainerBackground,
  };

  const { close, set } = languageObject;

  const handleSet = () => {
    setHsvColor(localHsvColor);
    setShowOverlayAndResetShowModal(false);
  };

  const handleClose = () => {
    setShowOverlayAndResetShowModal(false);
  };

  const { mouseDownHandlerRef } = useCloseOverlay(
    false,
    showOverlayRef,
    setShowOverlayAndResetShowModal,
  );

  const firstFocusableElementRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusableElementRef = useRef<HTMLButtonElement | null>(null);

  const firstFocusableElementKeyDownHandlerRef = useRef(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        lastFocusableElementRef.current?.focus();
      }
    },
  );

  const lastFocusableElementKeyDownHandlerRef = useRef(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        firstFocusableElementRef.current?.focus();
      }
    },
  );

  const onMouseDownRef = useRef((event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget)
      priorityFocusedElementRef.current = firstFocusableElementRef.current;
  });

  return (
    <>
      <div
        role="presentation"
        onMouseDown={mouseDownHandlerRef.current}
        className={blackOverlay}
      ></div>
      <dialog
        aria-modal={true}
        className={colorPickerModal}
        onMouseDown={onMouseDownRef.current}
      >
        <section className={scrollableArea}>
          <>
            {getPreviewInModalComponent(
              localHsvColor,
              firstFocusableElementRef,
              firstFocusableElementKeyDownHandlerRef,
            )}
            <ColorPickerOverlay
              colorPreviewRef={colorPreviewRef}
              setHsvColor={setLocalHsvColor}
              hsvColor={localHsvColor}
              id={id}
              setShowColorPickerOverlayAsModal={
                setShowColorPickerOverlayAsModal
              }
              showingColorPickerOverlayAsModalRef={
                showingColorPickerOverlayAsModalRef
              }
              colorPickerOverlayMountCallback={colorPickerOverlayMountCallback}
              colorPickerOverlayUnmountCallback={
                colorPickerOverlayUnmountCallback
              }
              rerenderOverlay={rerenderOverlay}
              trapFocus={false}
              scrollableAreaRef={scrollableAreaRef}
              getShouldShowAsModal={getShouldShowAsModal}
              getColorPickerOverlayPosition={getColorPickerOverlayPosition}
              setShowOverlayAndResetShowModal={setShowOverlayAndResetShowModal}
              customClasses={colorPickerOverlayCustomClassesModal}
              debug={debug}
            />
          </>
        </section>
        <footer className={footer}>
          <button
            type="button"
            className={`${defaultButton} ${closeButton}`}
            onClick={handleClose}
          >
            {close}
          </button>
          <ColorPickerBar
            hsvColor={localHsvColor}
            showOverlay={showOverlay}
            label={label}
            showColorPickerOverlayAsModal={showColorPickerOverlayAsModal}
            setHsvColor={setLocalHsvColor}
            customClasses={colorPickerBarCustomClassesModal}
          />
          <button
            type="button"
            ref={lastFocusableElementRef}
            className={`${defaultButton} ${okButton}`}
            onKeyDown={lastFocusableElementKeyDownHandlerRef.current}
            onClick={handleSet}
          >
            {set}
          </button>
        </footer>
      </dialog>
    </>
  );
};
