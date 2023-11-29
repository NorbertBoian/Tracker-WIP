import { getDimensions } from "./getDimensions";
import { getSpaceAvailability } from "./getSpaceAvailability";

export type getShouldShowAsModalType = ReturnType<
  typeof getShouldShowAsModalCreator
>;

export const getShouldShowAsModalCreator =
  (
    previewDayComponentFirstRowWrapperRef: React.MutableRefObject<HTMLDivElement | null>,
    headerRef: React.MutableRefObject<HTMLDivElement | null>,
    footerRef: React.MutableRefObject<HTMLDivElement | null>,
    applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>,
    modalWidthThreshhold = 0,
  ) =>
  (
    colorPickerOverlayRef: React.MutableRefObject<HTMLDialogElement | null>,
    colorPreviewRef: React.MutableRefObject<HTMLDivElement | null>,
    viewportWidth: number,
    viewportHeight: number,
  ) => {
    if (viewportWidth <= modalWidthThreshhold) return true;
    else if (
      colorPickerOverlayRef.current &&
      colorPreviewRef.current &&
      previewDayComponentFirstRowWrapperRef.current &&
      footerRef.current &&
      headerRef.current &&
      applicationSettingsContainerRef.current
    ) {
      const {
        colorPickerOverlayWidth,
        colorPickerOverlayHeight,
        colorPreviewX,
        colorPreviewY,
        colorPreviewWidth,
        colorPreviewHeight,
        dayPreviewX,
        dayPreviewY,
        dayPreviewWidth,
        dayPreviewHeight,
        footerHeight,
        headerHeight,
        settingsModalY,
        settingsModalX,
        settingsModalHeight,
        settingsModalWidth,
      } = getDimensions({
        colorPickerOverlayElement: colorPickerOverlayRef.current,
        colorPreviewElement: colorPreviewRef.current,
        dayPreviewDayNameElement: previewDayComponentFirstRowWrapperRef.current,
        headerElement: headerRef.current,
        footerElement: footerRef.current,
        applicationSettingsContainerElement:
          applicationSettingsContainerRef.current,
      });

      const isDayPreviewFullyVisibleTop =
        dayPreviewY > settingsModalY + headerHeight;
      const isDayPreviewFullyVisibleBottom =
        dayPreviewY + dayPreviewHeight < settingsModalY + settingsModalHeight;
      const isDayPreviewFullyVisibleLeft = dayPreviewX > settingsModalX;
      const isDayPreviewFullyVisibleRight =
        dayPreviewX + dayPreviewWidth < settingsModalX + settingsModalWidth;
      const isDayPreviewFullyVisibleHorizontally =
        isDayPreviewFullyVisibleLeft && isDayPreviewFullyVisibleRight;
      const isDayPreviewFullyVisibleVertically =
        isDayPreviewFullyVisibleBottom && isDayPreviewFullyVisibleTop;
      const isDayPreviewFullyVisible =
        isDayPreviewFullyVisibleHorizontally &&
        isDayPreviewFullyVisibleVertically;

      if (!isDayPreviewFullyVisible) return true;

      const { hasSpaceAvailable } = getSpaceAvailability({
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
      });

      return !hasSpaceAvailable;
    } else {
      return true;
    }
  };
