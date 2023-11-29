export const getNextFocusableElement = (
  element: HTMLElement,
  focusWithin = document.body as Element | null | undefined,
  wrapFocus = true,
) => {
  let currentElement: Element | null | undefined = element;
  let nextFocusableElement = undefined;
  while (currentElement) {
    const nextSibling: Element | null | undefined =
      currentElement === focusWithin
        ? focusWithin
        : currentElement?.nextElementSibling;
    if (
      nextSibling === null &&
      focusWithin?.contains(currentElement.parentElement)
    ) {
      if (wrapFocus || currentElement.parentElement !== focusWithin)
        currentElement = currentElement.parentElement;
      else currentElement = nextSibling;
    } else {
      currentElement = nextSibling;
      if (
        currentElement instanceof HTMLElement &&
        currentElement.offsetHeight
      ) {
        if (currentElement.tabIndex > -1) {
          nextFocusableElement = currentElement;
          currentElement = undefined;
        } else {
          const currentElementDescendants =
            currentElement.querySelectorAll("*");
          let index: number | undefined = 0;
          while (
            index !== undefined &&
            index < currentElementDescendants.length
          ) {
            const descendant = currentElementDescendants[index];
            if (
              descendant instanceof HTMLElement &&
              descendant.offsetHeight &&
              descendant.tabIndex > -1
            ) {
              nextFocusableElement = descendant;
              index = undefined;
              currentElement = undefined;
            } else {
              index++;
            }
          }
        }
      }
    }
  }
  return nextFocusableElement;
};
