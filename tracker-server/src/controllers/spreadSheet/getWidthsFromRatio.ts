export const getWidthsFromRatio = (ratio: number, width: number) => {
  const firstAddend = +`${ratio}`.split(".").join("");
  const secondAddend = Math.pow(10, [...`${ratio}`.split("."), ""][1].length);
  const sum = firstAddend + secondAddend;
  const firstFraction = firstAddend / sum;
  const secondFraction = secondAddend / sum;
  const firstWidth = Math.round(firstFraction * width);
  const secondWidth = Math.round(secondFraction * width);
  const difference = firstWidth + secondWidth - width;
  const adjustedSecondWidth = secondWidth - difference;
  return [firstWidth, adjustedSecondWidth];
};
