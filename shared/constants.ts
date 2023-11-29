export const displayedCurrencyNoEmptyStringRegex = /^\D{1,5}$/;

export const displayedCurrencyRegex = /^\D{0,5}$/;

export const requiredHoursRegex = /^1\d$|^2[0-4]$|^\d?$/;

export const requiredHoursNoEmptyStringRegex = /^1\d$|^2[0-4]$|^\d$/;

export const overtimeMultiplierRegex =
  /^0[.,]\d{1,3}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,4}$|^[.,]?\d+$|^$/;

export const hourlyRateRegex =
  /^0[.,]\d{1,4}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,5}$|^[.,]?\d+$|^$/;

export const overtimeMultiplierNoEmptyStringRegex =
  /^0[.,]\d{1,3}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,4}$|^[.,]?\d+$/;

export const hourlyRateNoEmptyStringRegex =
  /^0[.,]\d{1,4}$|^[1-9]\d*[.,]+\d+$|^[1-9]\d{1,5}$|^[.,]?\d+$/;

export const timeRegex =
  /^\d?$|^[01]\d$|^2[0-4]$|^(?:(?:(?:(?:[01]\d?)|(?:2[0-3]?)))|\d?):(?:[0-5]\d?)?$|^24:0{0,2}$/;
