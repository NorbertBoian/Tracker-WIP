import { getDimensions } from "./getDimensions";
import { getSpaceAvailability } from "./getSpaceAvailability";

export type getColorPickerOverlayPositionType = ReturnType<
  typeof getColorPickerOverlayPositionCreator
>;

interface getColorPickerOverlayPositionReturnType {
  positionsValues: {
    vertical: number;
    horizontal: number;
  };
  horizontalPosition: "right" | "left";
  verticalPosition: "top" | "bottom";
}

export const getColorPickerOverlayPositionCreator =
  (
    previewDayComponentFirstRowWrapperRef: React.MutableRefObject<HTMLDivElement | null>,
    headerRef: React.MutableRefObject<HTMLDivElement | null>,
    footerRef: React.MutableRefObject<HTMLDivElement | null>,
    applicationSettingsContainerRef: React.MutableRefObject<HTMLFormElement | null>,
  ) =>
  (
    colorPickerOverlayRef: React.MutableRefObject<HTMLDialogElement | null>,
    colorPreviewRef: React.MutableRefObject<HTMLDivElement | null>,
    viewportWidth: number,
    viewportHeight: number,
  ) => {
    if (
      colorPickerOverlayRef.current &&
      colorPreviewRef.current &&
      previewDayComponentFirstRowWrapperRef.current &&
      headerRef.current &&
      footerRef.current &&
      applicationSettingsContainerRef.current
    ) {
      const {
        colorPickerOverlayWidth,
        colorPickerOverlayHeight,
        colorPreviewX,
        colorPreviewY,
        colorPreviewWidth,
        colorPreviewHeight,
        dayPreviewY,
        dayPreviewHeight,
        footerHeight,
        settingsModalY,
        settingsModalHeight,
      } = getDimensions({
        colorPickerOverlayElement: colorPickerOverlayRef.current,
        colorPreviewElement: colorPreviewRef.current,
        dayPreviewDayNameElement: previewDayComponentFirstRowWrapperRef.current,
        headerElement: headerRef.current,
        footerElement: footerRef.current,
        applicationSettingsContainerElement:
          applicationSettingsContainerRef.current,
      });

      const {
        hasSpaceAvailableTop,
        hasSpaceAvailableRight,
        hasSpaceAvailableLeft,
      } = getSpaceAvailability({
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

      const verticalPosition = hasSpaceAvailableTop ? "top" : "bottom";
      const horizontalPosition =
        verticalPosition === "top"
          ? hasSpaceAvailableRight
            ? "right"
            : "left"
          : hasSpaceAvailableLeft
          ? "left"
          : "right";

      const positionedTopValue = colorPreviewY - colorPickerOverlayHeight;
      const positionedBottomValue = colorPreviewY + colorPreviewHeight;
      const positionedRightValue = colorPreviewX + colorPreviewWidth;
      const positionedLeftValue = colorPreviewX - colorPickerOverlayWidth;

      const allPositionValues = {
        top: positionedTopValue,
        bottom: positionedBottomValue,
        left: positionedLeftValue,
        right: positionedRightValue,
      };

      const positionsValues = {
        vertical: allPositionValues[verticalPosition],
        horizontal: allPositionValues[horizontalPosition],
      };

      const positions: getColorPickerOverlayPositionReturnType = {
        positionsValues,
        horizontalPosition,
        verticalPosition,
      };

      return positions;
    } else return false;
  };
