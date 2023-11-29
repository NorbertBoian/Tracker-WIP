import { useEffect, useRef, memo, useCallback } from "react";
import {
  ColorPickerBar,
  customClasssesType as ColorPickerBarCustomClasssesType,
} from "./ColorPickerBar/ColorPickerBar";
import {
  ColorPickerModal,
  customClasssesType as ColorPickerModalCustomClasssesType,
} from "./ColorPickerModal/ColorPickerModal";
import {
  ColorPickerOverlay,
  customClasssesType as ColorPickerOverlayCustomClasssesType,
} from "./ColorPickerOverlay/ColorPickerOverlay";

import { colorPickerWrapper } from "./ColorPicker.module.css";
import { getShouldShowAsModalType } from "../ApplicationSettings/ApplicationDaySettings/functions/getShouldShowAsModalCreator";
import { getColorPickerOverlayPositionType } from "../ApplicationSettings/ApplicationDaySettings/functions/getColorPickerOverlayPositionCreator";
import { languageObjectType } from "../../languages/en";
import { useCloseOverlay } from "../../hooks/useCloseOverlay";
import { useStateRef } from "../../hooks/useStateRef";
import { getDayPreviewComponentType } from "../ApplicationSettings/ApplicationDaySettings/ApplicationDaySettings";

interface ICustomClasses {
  colorPickerBar?: ColorPickerBarCustomClasssesType;
  colorPickerModal?: ColorPickerModalCustomClasssesType;
  colorPickerOverlay?: ColorPickerOverlayCustomClasssesType;
}

const defaultClasses = {
  colorPickerBar: {},
  colorPickerModal: {},
  colorPickerOverlay: {},
  colorPickerWrapper,
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

interface IProps {
  hsvColor: [number, number, number];
  setHsvColor: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  getPreviewInModalComponent?: getDayPreviewComponentType | typeof noop;
  colorPickerOverlayMountCallback?: (
    setShowColorPickerOverlay: (boolean: boolean) => void,
  ) => void;
  colorPickerOverlayUnmountCallback?: typeof noop;
  getShouldShowAsModal?: getShouldShowAsModalType;
  getColorPickerOverlayPosition?: getColorPickerOverlayPositionType;
  label: string;
  languageObject: languageObjectType;
  customClasses: ICustomClasses;
  colorPickerRef: React.MutableRefObject<HTMLDivElement | null>;
  id: string;
  scrollableAreaRef?: React.MutableRefObject<HTMLDivElement | null>;
  rerenderOverlay?: never[];
  debug?: string;
}

const emptyArray: never[] = [];

export const ColorPicker = memo(
  ({
    hsvColor,
    setHsvColor,
    getPreviewInModalComponent = () => null,
    colorPickerOverlayMountCallback = noop,
    colorPickerOverlayUnmountCallback = noop,
    customClasses = defaultClasses,
    label,
    getShouldShowAsModal = () => true,
    getColorPickerOverlayPosition = () => false,
    scrollableAreaRef = undefined,
    languageObject,
    colorPickerRef,
    rerenderOverlay = emptyArray,
    debug,
    id,
  }: IProps) => {
    const combinedClasses = { ...defaultClasses, ...customClasses };

    const { mouseDownHandlerRef, showOverlay, setShowOverlay, showOverlayRef } =
      useCloseOverlay<HTMLDivElement>(
        true,
        undefined,
        undefined,
        colorPickerRef,
      ); //Used ref attached to color picker parent instead of only the overlay to keep showing overlay if click is within the whole color picker, not just the overlay itself

    const colorPreviewRef = useRef<HTMLDivElement | null>(null);

    const [
      showColorPickerOverlayAsModal,
      setShowColorPickerOverlayAsModal,
      showColorPickerOverlayAsModalRef,
    ] = useStateRef<undefined | boolean>(undefined);

    useEffect(() => {
      const colorPreviewHalfNotInScrollableArea = (
        entries: IntersectionObserverEntry[],
      ) => {
        const isColorPreviewAtLeastHalfVisible = (
          entries.at(-1) as IntersectionObserverEntry
        ).isIntersecting;
        if (!isColorPreviewAtLeastHalfVisible) setShowOverlay(false);
      };

      const options = {
        root: scrollableAreaRef ? scrollableAreaRef.current : null,
        rootMargin: "0px",
        threshold: 0.5,
      };

      const intersectionObserver = new IntersectionObserver(
        colorPreviewHalfNotInScrollableArea,
        options,
      );

      if (colorPreviewRef.current)
        intersectionObserver.observe(colorPreviewRef.current);
      return () => {
        intersectionObserver.disconnect();
      };
    }, [scrollableAreaRef, colorPreviewRef, setShowOverlay]);

    const colorPickerMouseDownHandlerRef = useRef((event: MouseEvent) => {
      if (!showColorPickerOverlayAsModalRef.current)
        mouseDownHandlerRef.current(event);
    });

    useEffect(() => {
      const colorPickerMouseDownHandler =
        colorPickerMouseDownHandlerRef.current;
      window.document.body.addEventListener(
        "mousedown",
        colorPickerMouseDownHandler,
      );
      return () => {
        window.document.body.removeEventListener(
          "mousedown",
          colorPickerMouseDownHandler,
        );
      };
    }, [mouseDownHandlerRef, scrollableAreaRef]);

    const setShowOverlayAndResetShowModal = useCallback(
      (value: React.SetStateAction<boolean | 2>) => {
        setShowOverlay(value);
        setShowColorPickerOverlayAsModal(undefined);
      },
      [setShowColorPickerOverlayAsModal, setShowOverlay],
    );

    const handlePreviewClickRef = useRef(() => {
      setShowOverlayAndResetShowModal((showOverlay) => !showOverlay);
    });

    const priorityFocusedElementRef = useRef<HTMLElement | undefined | null>(
      undefined,
    );

    const keyDownHandlerRef = useRef((event: KeyboardEvent) => {
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
      const keyDownHandler = keyDownHandlerRef.current;
      window.document.body.addEventListener("keydown", keyDownHandler);
      return () => {
        window.document.body.removeEventListener("keydown", keyDownHandler);
      };
    }, []);

    return (
      <div className={combinedClasses.colorPickerWrapper} ref={colorPickerRef}>
        <ColorPickerBar
          colorPreviewRef={colorPreviewRef}
          hsvColor={hsvColor}
          showOverlay={showOverlay}
          label={label}
          showColorPickerOverlayAsModal={showColorPickerOverlayAsModal}
          onClickRef={handlePreviewClickRef}
          setHsvColor={setHsvColor}
          id={id}
          debug={debug}
          customClasses={combinedClasses.colorPickerBar}
        />
        {showOverlay ? (
          showColorPickerOverlayAsModal ? (
            <ColorPickerModal
              colorPreviewRef={colorPreviewRef}
              setHsvColor={setHsvColor}
              hsvColor={hsvColor}
              languageObject={languageObject}
              id={id}
              rerenderOverlay={rerenderOverlay}
              priorityFocusedElementRef={priorityFocusedElementRef}
              showOverlay={showOverlay}
              label={label}
              showColorPickerOverlayAsModal={showColorPickerOverlayAsModal}
              setShowColorPickerOverlayAsModal={
                setShowColorPickerOverlayAsModal
              }
              showingColorPickerOverlayAsModalRef={
                showColorPickerOverlayAsModalRef
              }
              colorPickerOverlayMountCallback={colorPickerOverlayMountCallback}
              colorPickerOverlayUnmountCallback={
                colorPickerOverlayUnmountCallback
              }
              getShouldShowAsModal={getShouldShowAsModal}
              getColorPickerOverlayPosition={getColorPickerOverlayPosition}
              setShowOverlayAndResetShowModal={setShowOverlayAndResetShowModal}
              scrollableAreaRef={scrollableAreaRef}
              showOverlayRef={showOverlayRef}
              customClasses={combinedClasses.colorPickerModal}
              colorPickerOverlayCustomClasses={
                combinedClasses.colorPickerOverlay
              }
              getPreviewInModalComponent={getPreviewInModalComponent}
              debug={debug}
            />
          ) : (
            <ColorPickerOverlay
              colorPreviewRef={colorPreviewRef}
              setHsvColor={setHsvColor}
              hsvColor={hsvColor}
              rerenderOverlay={rerenderOverlay}
              priorityFocusedElementRef={priorityFocusedElementRef}
              setShowColorPickerOverlayAsModal={
                setShowColorPickerOverlayAsModal
              }
              showingColorPickerOverlayAsModalRef={
                showColorPickerOverlayAsModalRef
              }
              id={id}
              customClasses={combinedClasses.colorPickerOverlay}
              colorPickerOverlayMountCallback={colorPickerOverlayMountCallback}
              colorPickerOverlayUnmountCallback={
                colorPickerOverlayUnmountCallback
              }
              getShouldShowAsModal={getShouldShowAsModal}
              getColorPickerOverlayPosition={getColorPickerOverlayPosition}
              scrollableAreaRef={scrollableAreaRef}
              setShowOverlayAndResetShowModal={setShowOverlayAndResetShowModal}
              debug={debug}
            />
          )
        ) : null}
      </div>
    );
  },
);

ColorPicker.displayName = "ColorPicker";
