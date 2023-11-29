export const isDescendant = (
  ancestor: HTMLElement | null,
  descendant: HTMLElement | null,
) => {
  let parent = descendant;
  let isDescendant = false;
  while (parent && !isDescendant) {
    if (parent === ancestor) {
      isDescendant = true;
    } else {
      parent = parent.parentElement;
    }
  }
  return isDescendant;
};
