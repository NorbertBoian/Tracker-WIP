export const getFutureOptionIndex = (
  event,
  reversedArrows,
  currentOptionIndex,
  options,
) => {
  const eventTargetIsRightArrow =
    event.currentTarget instanceof HTMLElement &&
    event.currentTarget.dataset.arrow === "right";
  const eventTargetIsLeftArrow =
    event.currentTarget instanceof HTMLElement &&
    event.currentTarget.dataset.arrow === "left";
  const lastOptionIndex = options.length - 1;
  if (reversedArrows) {
    if (eventTargetIsRightArrow) {
      if (currentOptionIndex === 0) {
        return lastOptionIndex;
      } else {
        return currentOptionIndex - 1;
      }
    } else {
      if (currentOptionIndex === lastOptionIndex) {
        return 0;
      } else {
        return currentOptionIndex + 1;
      }
    }
  } else {
    if (eventTargetIsLeftArrow) {
      if (currentOptionIndex === 0) {
        return lastOptionIndex;
      } else {
        return currentOptionIndex - 1;
      }
    } else {
      if (currentOptionIndex === lastOptionIndex) {
        return 0;
      } else {
        return currentOptionIndex + 1;
      }
    }
  }
};
