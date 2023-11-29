export const scrollToChild = (
  childElement: HTMLElement,
  scroll: "nearest" | "top" | "bottom" | "center" = "nearest",
): number | Error => {
  const parentElement = childElement.parentElement;
  if (parentElement) {
    const children = [...parentElement.children] as HTMLElement[];
    const childIndex = children.findIndex(
      (element) => element === childElement,
    );

    const childrenHeight = children.map((child) => child.offsetHeight);
    const childHeight = childrenHeight[childIndex];

    const parentVisibleScrollingHeight = parentElement.clientHeight;
    const parentScrollHeight = parentElement.scrollHeight;

    const aboveCurrentView = parentElement.scrollTop;
    const childTop = childrenHeight
      .slice(0, childIndex)
      .reduce((acc, heigth) => acc + heigth, 0);

    const childBottom = childTop + childHeight;
    const childInvisibleAmount = childBottom - parentVisibleScrollingHeight;

    const belowCurrentView = parentVisibleScrollingHeight + aboveCurrentView;

    const scrollAmountTop =
      childTop >= aboveCurrentView && childBottom <= belowCurrentView
        ? aboveCurrentView
        : childTop < parentScrollHeight
        ? childTop
        : parentScrollHeight;

    const scrollAmountBottom =
      childTop >= aboveCurrentView && childBottom <= belowCurrentView
        ? aboveCurrentView
        : childInvisibleAmount > 0
        ? childInvisibleAmount
        : 0;

    const scrollAmountCenter =
      childTop >= aboveCurrentView && childBottom <= belowCurrentView
        ? aboveCurrentView
        : childTop - parentVisibleScrollingHeight / 2 + childHeight / 2 >
          parentScrollHeight
        ? parentScrollHeight
        : childTop - parentVisibleScrollingHeight / 2 + childHeight / 2 < 0
        ? 0
        : childTop - parentVisibleScrollingHeight / 2 + childHeight / 2;

    const scrollAmount =
      scroll === "nearest"
        ? Math.abs(scrollAmountTop - aboveCurrentView) <
          Math.abs(scrollAmountBottom - aboveCurrentView)
          ? scrollAmountTop
          : scrollAmountBottom
        : scroll === "bottom"
        ? scrollAmountBottom
        : scroll === "top"
        ? scrollAmountTop
        : scrollAmountCenter;

    return (parentElement.scrollTop = scrollAmount);
  } else return Error("Does not have parent");
};
