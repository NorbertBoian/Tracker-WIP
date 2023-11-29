import { dateNumberType } from "../constants";

export const date = "date" as const;
export const beganString = "beganString" as const;
export const endedString = "endedString" as const;
export const isHoliday = "isHoliday" as const;
export const overtimeMultiplier = "overtimeMultiplier" as const;
export const hourlyRate = "hourlyRate" as const;
export const requiredHours = "requiredHours" as const;

export interface IDate {
  date: number;
  [beganString]: string;
  [endedString]: string;
  [isHoliday]: boolean;
  [overtimeMultiplier]: string;
  [hourlyRate]: string;
  [requiredHours]: string;
}

export type DateObject = Omit<IDate, typeof date> & {
  date: dateNumberType;
} extends infer O
  ? { [Q in keyof O]: O[Q] } //Getting rid of ampersand
  : never[];

export type Dates = [Record<string, never>, ...IDate[]];

export const getEmptyDatesArray = (year: number, month: number) => {
  const numberOfDays = new Date(Date.UTC(year, month + 1, 0)).getDate();
  return Array.from({ length: numberOfDays + 1 }, (v, index) => {
    if (index === 0) return {};
    else {
      return {
        [date]: Date.UTC(year, month, index),
        [beganString]: "",
        [endedString]: "",
        [isHoliday]: false,
        [overtimeMultiplier]: "",
        [hourlyRate]: "",
        [requiredHours]: "",
      };
    }
  }) as Dates;
};
