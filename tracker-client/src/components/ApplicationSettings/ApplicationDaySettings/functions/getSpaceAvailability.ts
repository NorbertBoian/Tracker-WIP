interface IParameters {
  colorPreviewX: number;
  colorPreviewY: number;
  colorPickerOverlayWidth: number;
  colorPickerOverlayHeight: number;
  dayPreviewY: number;
  colorPreviewWidth: number;
  dayPreviewHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  colorPreviewHeight: number;
  settingsModalY: number;
  settingsModalHeight: number;
  footerHeight: number;
}

export const getSpaceAvailability = ({
  colorPreviewX,
  colorPreviewY,
  colorPickerOverlayWidth,
  colorPickerOverlayHeight,
  dayPreviewY,
  colorPreviewWidth,
  dayPreviewHeight,
  viewportWidth,
  viewportHeight,
  colorPreviewHeight,
  settingsModalY,
  settingsModalHeight,
  footerHeight,
}: IParameters) => {
  const hasSpaceAvailableTop =
    colorPreviewY - colorPickerOverlayHeight > dayPreviewY + dayPreviewHeight;
  const hasSpaceAvailableLeft = colorPreviewX - colorPickerOverlayWidth > 0;
  const hasSpaceAvailableRight =
    colorPreviewX + colorPreviewWidth + colorPickerOverlayWidth < viewportWidth;
  const hasSpaceAvailableBottom =
    colorPreviewY + colorPreviewHeight + colorPickerOverlayHeight <
    viewportHeight -
      (hasSpaceAvailableRight
        ? viewportHeight - settingsModalY - settingsModalHeight + footerHeight
        : 0);
  const hasSpaceAvailableVertically =
    hasSpaceAvailableTop || hasSpaceAvailableBottom;
  const hasSpaceAvailableHorizontally =
    hasSpaceAvailableLeft || hasSpaceAvailableRight;
  const hasSpaceAvailable =
    hasSpaceAvailableVertically && hasSpaceAvailableHorizontally;

  return {
    hasSpaceAvailableTop,
    hasSpaceAvailableLeft,
    hasSpaceAvailableRight,
    hasSpaceAvailableBottom,
    hasSpaceAvailableVertically,
    hasSpaceAvailableHorizontally,
    hasSpaceAvailable,
  };
};
