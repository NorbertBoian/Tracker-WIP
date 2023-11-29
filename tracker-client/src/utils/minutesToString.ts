export const minutesToString = (minutes: number): string | undefined => {
  if (isNaN(minutes) === true) return undefined;
  const hoursString = `0${Math.trunc(minutes / 60)}`.slice(-2);
  const minutesString = `0${Math.trunc(minutes % 60)}`.slice(-2);
  const combinedString = `${hoursString}:${minutesString}`;
  return combinedString;
};
