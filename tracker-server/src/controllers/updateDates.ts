import { Request, Response } from "express";
import { Knex } from "knex";
import {
  date,
  days,
  days_custom_hourly_rate,
  days_custom_overtime_multiplier,
  days_custom_required_hours,
  day_id,
  holidays,
  interval_number,
  IS_DISTINCT_FROM_excluded,
  monthNumberType,
  months_input_disabled,
  month_id,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
  work_intervals,
} from "../constants";
import { getMonthId } from "../functions/getMonthId";
import { DateObject } from "../utils/getEmptyDatesArray";
import { handleError } from "../utils/handleError";
import { validateUpdateDatesRequestBody } from "../validations/validateUpdateDatesRequestBody";

interface IExpectedRequestBody {
  year: number;
  month: monthNumberType;
  dates: DateObject;
  inputDisabled: boolean;
}

type IResponseBody = string;

const successfullyUpdatedDates = `${successfullyUpdated} dates.` as const;

export const updateDates = async (
  req: Request<
    { [key: string]: string },
    IResponseBody,
    { [key: string]: unknown }
  >,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    const { userId } = req.session;
    if (!userId)
      throw new Error(notLoggedInMessage, {
        cause: { sendMessage: true, responseCode: 401 },
      });

    const validData = validateUpdateDatesRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { year, month, dates, inputDisabled } = validData;

    await db.transaction(async (trx) => {
      const monthId = await getMonthId(trx, userId, year, month);

      //Upserting days
      const daysArray = dates.map((date) => ({
        date: date.date,
        month_id: monthId as number,
      }));
      await trx(days).insert(daysArray).onConflict([month_id, date]).ignore();

      //Getting day IDs
      const daysDates = daysArray.map((day) => day.date);
      const dayIds = await trx(days)
        .where({ month_id: monthId })
        .andWhere(date, "in", daysDates)
        .select(day_id, date);

      //Upserting work intervals
      const workIntervals = dayIds.map((dayId) => ({
        interval_number: 1,
        began: dates[dayId.date - 1].beganString,
        ended: dates[dayId.date - 1].endedString,
        day_id: dayId.day_id,
      }));
      await trx(work_intervals)
        .insert(workIntervals)
        .onConflict([day_id, interval_number])
        .merge()
        .whereRaw(`${work_intervals} ${IS_DISTINCT_FROM_excluded}`);

      //Upserting non empty overtime multipliers
      const customOvertimeMultipliers = dayIds.map((dayId) => ({
        day_id: dayId.day_id,
        day_custom_overtime_multiplier:
          dates[dayId.date - 1].overtimeMultiplier,
      }));
      const customOvertimeMultipliersNoNulls = customOvertimeMultipliers.filter(
        (day) => day.day_custom_overtime_multiplier !== "",
      );
      if (customOvertimeMultipliersNoNulls.length > 0) {
        await trx(days_custom_overtime_multiplier)
          .insert(customOvertimeMultipliersNoNulls)
          .onConflict(day_id)
          .merge()
          .whereRaw(
            `${days_custom_overtime_multiplier} ${IS_DISTINCT_FROM_excluded}`,
          );
      }

      //Deleting empty overtime multipliers
      const customOvertimeMultipliersOnlyNulls = customOvertimeMultipliers
        .filter((day) => day.day_custom_overtime_multiplier === "")
        .map((day) => day.day_id);
      await trx(days_custom_overtime_multiplier)
        .whereIn(day_id, customOvertimeMultipliersOnlyNulls)
        .del();

      //Upserting non empty hourly rates
      const customHourlyRates = dayIds.map((dayId) => ({
        day_id: dayId.day_id,
        day_custom_hourly_rate: dates[dayId.date - 1].hourlyRate,
      }));
      const customHourlyRatesNoNulls = customHourlyRates.filter(
        (day) => day.day_custom_hourly_rate !== "",
      );
      if (customHourlyRatesNoNulls.length > 0) {
        await trx(days_custom_hourly_rate)
          .insert(customHourlyRatesNoNulls)
          .onConflict(day_id)
          .merge()
          .whereRaw(`${days_custom_hourly_rate} ${IS_DISTINCT_FROM_excluded}`);
      }

      //Deleting empty hourly rates
      const customHourlyRatesOnlyNulls = customHourlyRates
        .filter((day) => day.day_custom_hourly_rate === "")
        .map((day) => day.day_id);
      await trx(days_custom_hourly_rate)
        .whereIn(day_id, customHourlyRatesOnlyNulls)
        .del();

      //Upserting non empty required hours
      const customRequiredHours = dayIds.map((dayId) => ({
        day_id: dayId.day_id,
        day_custom_required_hours: dates[dayId.date - 1].requiredHours,
      }));
      const customRequiredHoursNoNulls = customRequiredHours.filter(
        (day) => day.day_custom_required_hours !== "",
      );
      if (customRequiredHoursNoNulls.length > 0) {
        await trx(days_custom_required_hours)
          .insert(customRequiredHoursNoNulls)
          .onConflict(day_id)
          .merge()
          .whereRaw(
            `${days_custom_required_hours} ${IS_DISTINCT_FROM_excluded}`,
          );
      }

      //Deleting empty required hours
      const customRequiredHoursOnlyNulls = customRequiredHours
        .filter((day) => day.day_custom_required_hours === "")
        .map((day) => day.day_id);
      await trx(days_custom_required_hours)
        .whereIn(day_id, customRequiredHoursOnlyNulls)
        .del();

      //Upserting true holiday statuses
      const holidayStatuses = dayIds.map((dayId) => ({
        day_id: dayId.day_id,
        is_holiday: dates[dayId.date - 1].isHoliday,
      }));
      const areHolidays = holidayStatuses.filter(
        (day) => day.is_holiday === true,
      );

      if (areHolidays.length > 0) {
        await trx(holidays)
          .insert(areHolidays)
          .onConflict(day_id)
          .merge()
          .whereRaw(`${holidays} ${IS_DISTINCT_FROM_excluded}`);
      }

      //Deleting false holiday statuses
      const notHolidays = holidayStatuses
        .filter((day) => day.is_holiday === false)
        .map((day) => day.day_id);
      await trx(holidays).whereIn(day_id, notHolidays).del();

      //Upserting and deleting input disabled accordingly
      if (inputDisabled === true) {
        await trx(months_input_disabled)
          .insert({ month_id: monthId, input_disabled: true })
          .onConflict(month_id)
          .merge()
          .whereRaw(`${months_input_disabled} ${IS_DISTINCT_FROM_excluded}`);
      } else {
        await trx(months_input_disabled).where({ month_id: monthId }).del();
      }

      return res.status(204).send();
    });
  } catch (err) {
    handleError(err, res);
  }
};
