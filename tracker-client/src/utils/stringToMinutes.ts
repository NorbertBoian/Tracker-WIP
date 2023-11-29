export const stringToMinutes = (string: string): number | undefined => {
  string = `0${string}`.slice(-5);
  if (string !== undefined && string.length === 5 && string[2] === ":") {
    const hour = +string.slice(0, 2);
    const minute = +string.slice(-2);
    const minutes = hour * 60 + minute;
    return minutes;
  } else {
    return undefined;
  }
};
