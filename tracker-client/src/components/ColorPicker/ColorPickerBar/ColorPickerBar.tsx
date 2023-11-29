import {
  ChangeEvent,
  useEffect,
  useState,
  KeyboardEvent,
  useRef,
  useLayoutEffect,
} from "react";
import { hexToHsv, hsvToHex, hsvToRgb } from "../../../utils/colorConversions";
import { defaultButton, defaultInput } from "../../../sharedStyles.module.css";
import defaultClasses from "./ColorPickerBar.module.css";
import { emptyObject } from "../../../constants/constants";
import { useFocusOutline } from "../../../hooks/useFocusOutline";
export type customClasssesType = Partial<typeof defaultClasses>;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const noopRef = { current: noop };

interface IProps {
  onClickRef?: React.MutableRefObject<typeof noop>;
  hsvColor: [number, number, number];
  setHsvColor: React.Dispatch<React.SetStateAction<[number, number, number]>>;
  colorPreviewRef?: React.MutableRefObject<HTMLDivElement | null>;
  customClasses?: Partial<typeof defaultClasses>;
  showColorPickerOverlayAsModal: boolean | undefined;
  showOverlay: boolean | 2;
  label: string;
  id?: string;
}

export const ColorPickerBar = ({
  onClickRef = noopRef,
  hsvColor,
  id,
  showColorPickerOverlayAsModal,
  showOverlay,
  setHsvColor,
  label,
  colorPreviewRef = undefined,
  customClasses = emptyObject,
  debug,
}: IProps) => {
  const [hexInputValue, setHexInputValue] = useState("");

  const combinedClasses = { ...defaultClasses, ...customClasses };

  const {
    colorPickerBar,
    colorPreview,
    hexInput,
    noMouseInteraction,
    colorPreviewColoredRectangle,
    colorPreviewColoredRectangleBorderColor,
    hexInputBackgroundColor,
    focusOutline,
  } = combinedClasses;

  const handleHexInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const first = value[0];
    const replacedValue = value
      .replace(/[^a-fA-F\d]/g, "")
      .slice(0, 6)
      .toUpperCase();
    const controlledValue = first === "#" ? `#${replacedValue}` : replacedValue;
    if (replacedValue.length === 6) {
      const hexReplacedValue = `#${replacedValue}`;
      setHexInputValue(hexReplacedValue);
      setHsvColor(hexToHsv(hexReplacedValue));
    } else setHexInputValue(controlledValue);
  };

  const rgbColor = hsvToRgb(hsvColor);
  const red = rgbColor[0];
  const green = rgbColor[1];
  const blue = rgbColor[2];
  const rgbColorString = `rgb(${red},${green},${blue})`;

  useLayoutEffect(() => {
    setHexInputValue(hsvToHex(hsvColor));
  }, [hsvColor]);

  const onKeyDownRef = useRef((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      onClickRef.current();
    }
  });

  const {
    onInputMouseDownRef,
    onInputFocusRef,
    onInputBlurRef,
    inputisFocused,
  } = useFocusOutline();

  return (
    <fieldset className={colorPickerBar}>
      <div
        className={colorPreview}
        {...(colorPreviewRef ? { ref: colorPreviewRef } : {})}
      >
        <div //Using div instead on button to prevent button trigger on keyup, e.g. after focus has been restored
          role="button"
          aria-haspopup="dialog"
          aria-controls={
            showColorPickerOverlayAsModal ? `${id}Dialog` : `${id}Overlay`
          }
          tabIndex={showOverlay ? -1 : 0}
          onKeyDown={onKeyDownRef.current}
          aria-label={label}
          aria-expanded={!!showOverlay}
          className={`${defaultButton} ${colorPreviewColoredRectangle} ${colorPreviewColoredRectangleBorderColor}`}
          onClick={onClickRef.current}
          style={{ backgroundColor: rgbColorString }}
        ></div>
      </div>
      <input
        title="Hex color input"
        // title={hexColorInput}
        onMouseDown={onInputMouseDownRef.current}
        onFocus={onInputFocusRef.current}
        autoComplete="off"
        onBlur={onInputBlurRef.current}
        className={`${defaultInput} ${hexInput} ${hexInputBackgroundColor} ${
          inputisFocused ? focusOutline : ""
        }`}
        onChange={handleHexInputChange}
        value={hexInputValue}
      />
    </fieldset>
  );
};
