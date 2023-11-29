export interface IDate {
  date: number;
  beganString: string;
  endedString: string;
  isHoliday: boolean;
  overtimeMultiplier: string;
  hourlyRate: string;
  requiredHours: string;
}

export type Dates = [Record<string, never>, ...IDate[]];

export const getEmptyDatesArray = (year: number, month: number) => {
  const numberOfDays = new Date(Date.UTC(year, month + 1, 0)).getDate();
  return Array.from({ length: numberOfDays + 1 }, (v, index) => {
    if (index === 0) return {};
    else {
      return {
        date: Date.UTC(year, month, index),
        beganString: "",
        endedString: "",
        isHoliday: false,
        overtimeMultiplier: "",
        hourlyRate: "",
        requiredHours: "",
      };
    }
  }) as Dates;
};
