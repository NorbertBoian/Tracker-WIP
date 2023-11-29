export const computeSalary = (
  requiredHours: number,
  minutesWorked: number,
  hourlyRate: number,
  overtimeMultiplier: number,
) => {
  const minutesRequired = requiredHours * 60;
  const minuteByMinuteRate = hourlyRate / 60;

  const overtimePay =
    Math.max(0, minutesWorked - minutesRequired) *
    minuteByMinuteRate *
    overtimeMultiplier;

  const regularPay =
    Math.min(minutesRequired, minutesWorked) * minuteByMinuteRate;

  const salary = Math.max(0, regularPay + overtimePay);

  return salary;
};
