export type getShouldCloseOverlayType = ReturnType<
  typeof getShouldCloseOverlayCreator
>;

export const getShouldCloseOverlayCreator =
  (
    footerRef: React.MutableRefObject<HTMLDivElement | null>,
    headerRef: React.MutableRefObject<HTMLDivElement | null>,
    applicationSettingsContainerRef: React.MutableRefObject<HTMLDivElement | null>,
  ) =>
  (colorPreviewRef: React.MutableRefObject<HTMLDivElement | null>) => {
    if (
      colorPreviewRef.current &&
      applicationSettingsContainerRef.current &&
      footerRef.current &&
      headerRef.current
    ) {
      const colorPreviewRect = colorPreviewRef.current.getBoundingClientRect();
      const footerRect = footerRef.current.getBoundingClientRect();
      const settingsModalRect =
        applicationSettingsContainerRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      const {
        x: colorPreviewX,
        y: colorPreviewY,
        width: colorPreviewWidth,
        height: colorPreviewHeight,
      } = colorPreviewRect;

      const { height: footerHeight } = footerRect;

      const { height: headerHeight } = headerRect;

      const {
        x: settingsModalX,
        y: settingsModalY,
        width: settingsModalWidth,
        height: settingsModalHeight,
      } = settingsModalRect;

      //At least half visible

      const isColorPreviewPartiallyVisibleTop =
        colorPreviewY + colorPreviewHeight / 2 <
        settingsModalY + settingsModalHeight - footerHeight;
      const isColorPreviewPartiallyVisibleBottom =
        colorPreviewY + colorPreviewHeight / 2 > settingsModalY + headerHeight;
      const isColorPreviewPartiallyVisibleLeft =
        colorPreviewX + colorPreviewWidth / 2 <
        settingsModalX + settingsModalWidth;
      const isColorPreviewPartiallyVisibleRight =
        colorPreviewX + colorPreviewWidth / 2 > settingsModalX;
      const isColorPreviewPartiallyVisibleVertically =
        isColorPreviewPartiallyVisibleBottom &&
        isColorPreviewPartiallyVisibleTop;
      const isColorPreviewPartiallyVisibleHorizontally =
        isColorPreviewPartiallyVisibleLeft &&
        isColorPreviewPartiallyVisibleRight;
      const isColorPreviewAtLeastPartiallyVisible =
        isColorPreviewPartiallyVisibleVertically &&
        isColorPreviewPartiallyVisibleHorizontally;

      return !isColorPreviewAtLeastPartiallyVisible;
    } else return true;
  };
