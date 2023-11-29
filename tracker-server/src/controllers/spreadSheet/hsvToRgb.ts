export const hsvToRgb = (
  hsv: [number, number, number],
): [number, number, number] => {
  const h = hsv[0];
  const s = hsv[1];
  const v = hsv[2];
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5), f(3), f(1)]; // [1,0,1]
};
