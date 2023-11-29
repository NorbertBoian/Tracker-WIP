export const rgbToHsv = (
  rgb: [number, number, number],
): [number, number, number] => {
  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
};

export const hsvToRgb = (
  hsv: [number, number, number],
): [number, number, number] => {
  const h = hsv[0];
  const s = hsv[1];
  const v = hsv[2];
  const f = (n: number, k = (n + h / 60) % 6) =>
    v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  return [f(5) * 255, f(3) * 255, f(1) * 255];
};

export const hexToRgb = (hex: string) => {
  const r = parseInt(hex[1] + hex[2], 16);
  const g = parseInt(hex[3] + hex[4], 16);
  const b = parseInt(hex[5] + hex[6], 16);
  const rgb: [number, number, number] = [r, g, b];
  return rgb;
};

export const rgbToHex = (rgb: [number, number, number]) => {
  const colorToHex = (color: number) => {
    const hexadecimal = Math.round(color).toString(16);
    return hexadecimal.length == 1 ? "0" + hexadecimal : hexadecimal;
  };
  return `#${colorToHex(rgb[0])}${colorToHex(rgb[1])}${colorToHex(
    rgb[2],
  )}`.toUpperCase();
};

export const hexToHsv = (hex: string) => {
  const rgb = hexToRgb(hex);
  const hsv = rgbToHsv(rgb);
  return hsv;
};

export const hsvToHex = (hsv: [number, number, number]) => {
  const rgb = hsvToRgb(hsv);
  const hex = rgbToHex(rgb);
  return hex;
};
