interface IParameters {
  colorPickerOverlayElement: HTMLDialogElement;
  colorPreviewElement: HTMLDivElement;
  dayPreviewDayNameElement: HTMLDivElement;
  footerElement: HTMLDivElement;
  headerElement: HTMLDivElement;
  applicationSettingsContainerElement: HTMLFormElement;
}
export const getDimensions = ({
  colorPickerOverlayElement,
  colorPreviewElement,
  dayPreviewDayNameElement,
  footerElement,
  headerElement,
  applicationSettingsContainerElement,
}: IParameters) => {
  const colorPickerOverlayWidth = colorPickerOverlayElement.offsetWidth;
  const colorPickerOverlayHeight = colorPickerOverlayElement.offsetHeight;

  const colorPreviewRect = colorPreviewElement.getBoundingClientRect();
  const dayPreviewRect = dayPreviewDayNameElement.getBoundingClientRect();
  const footerRect = footerElement.getBoundingClientRect();
  const headerRect = headerElement.getBoundingClientRect();
  const settingsModalRect =
    applicationSettingsContainerElement.getBoundingClientRect();
  const {
    x: colorPreviewX,
    y: colorPreviewY,
    width: colorPreviewWidth,
    height: colorPreviewHeight,
  } = colorPreviewRect;

  const {
    x: dayPreviewX,
    y: dayPreviewY,
    width: dayPreviewWidth,
    height: dayPreviewHeight,
  } = dayPreviewRect;
  const { height: footerHeight } = footerRect;
  const { height: headerHeight } = headerRect;
  const {
    y: settingsModalY,
    x: settingsModalX,
    height: settingsModalHeight,
    width: settingsModalWidth,
  } = settingsModalRect;

  return {
    colorPickerOverlayWidth,
    colorPickerOverlayHeight,
    colorPreviewX,
    colorPreviewY,
    colorPreviewWidth,
    colorPreviewHeight,
    dayPreviewX,
    dayPreviewWidth,
    dayPreviewY,
    dayPreviewHeight,
    footerHeight,
    headerHeight,
    settingsModalX,
    settingsModalY,
    settingsModalWidth,
    settingsModalHeight,
  };
};
