export const getPreviousFocusableElement = (
  element: HTMLElement,
  focusWithin = document.body as Element | null | undefined,
  wrapFocus = true,
) => {
  let currentElement: Element | null | undefined = element;
  let previousFocusableElement = undefined;
  while (currentElement) {
    const previousSibling: Element | null | undefined =
      currentElement === focusWithin
        ? focusWithin
        : currentElement?.previousElementSibling;
    if (
      previousSibling === null &&
      focusWithin?.contains(currentElement.parentElement)
    ) {
      if (wrapFocus || currentElement.parentElement !== focusWithin)
        currentElement = currentElement.parentElement;
      else currentElement = previousSibling;
    } else {
      currentElement = previousSibling;
      if (
        currentElement instanceof HTMLElement &&
        currentElement.offsetHeight
      ) {
        if (currentElement.tabIndex > -1) {
          previousFocusableElement = currentElement;
          currentElement = undefined;
        } else {
          const currentElementDescendants =
            currentElement.querySelectorAll("*");
          let index: number | undefined = currentElementDescendants.length - 1;
          while (index !== undefined && index > -1) {
            const descendant = currentElementDescendants[index];
            if (
              descendant instanceof HTMLElement &&
              descendant.offsetHeight &&
              descendant.tabIndex > -1
            ) {
              previousFocusableElement = descendant;
              index = undefined;
              currentElement = undefined;
            } else {
              index--;
            }
          }
        }
      }
    }
  }
  return previousFocusableElement;
};
