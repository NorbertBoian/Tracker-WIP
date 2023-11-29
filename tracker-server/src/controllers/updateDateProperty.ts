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
  month_id,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
  work_intervals,
} from "../constants";
import { getMonthId } from "../functions/getMonthId";
import {
  beganString,
  DateObject,
  endedString,
  hourlyRate,
  isHoliday,
  overtimeMultiplier,
  requiredHours,
} from "../utils/getEmptyDatesArray";
import { handleError } from "../utils/handleError";
import { validateUpdateDatePropertyRequestBody } from "../validations/validateUpdateDatePropertyRequestBody";

type IResponseBody = string;

type ExpectedRequestBody<Key extends keyof DateObject> = {
  date: number;
  key: Key;
  value: DateObject[Key];
  year: number;
  month: monthNumberType;
};

export const updateDateProperty = async (
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

    const validData = validateUpdateDatePropertyRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { year, month, date: dateNumber, key, value } = validData;

    await db.transaction(async (trx) => {
      const monthId = await getMonthId(trx, userId, year, month);

      const day = {
        date: dateNumber,
        month_id: monthId,
      };
      await trx(days).insert(day).onConflict([month_id, date]).ignore();

      const dayIdResult = await trx(days)
        .where({ month_id: monthId, date: dateNumber })
        .select(day_id, date);
      const dayId = dayIdResult[0];

      if (key === beganString || key === endedString) {
        const workInterval = {
          interval_number: 1,
          //Removing 'String' from key to fit database column name
          [key.slice(0, 5)]: value,
          day_id: dayId.day_id,
        };
        await trx(work_intervals)
          .insert(workInterval)
          .onConflict([day_id, interval_number])
          .merge()
          .whereRaw(`${work_intervals} ${IS_DISTINCT_FROM_excluded}`);
      }

      if (key === overtimeMultiplier) {
        if (value !== "") {
          const customOvertimeMultiplier = {
            day_id: dayId.day_id,
            day_custom_overtime_multiplier: value,
          };
          await trx(days_custom_overtime_multiplier)
            .insert(customOvertimeMultiplier)
            .onConflict(day_id)
            .merge()
            .whereRaw(
              `${days_custom_overtime_multiplier} ${IS_DISTINCT_FROM_excluded}`,
            );
        } else {
          await trx(days_custom_overtime_multiplier)
            .where({ day_id: dayId.day_id })
            .del();
        }
      }

      if (key === hourlyRate) {
        if (value !== "") {
          const customHourlyRate = {
            day_id: dayId.day_id,
            day_custom_hourly_rate: value,
          };
          await trx(days_custom_hourly_rate)
            .insert(customHourlyRate)
            .onConflict(day_id)
            .merge()
            .whereRaw(
              `${days_custom_hourly_rate} ${IS_DISTINCT_FROM_excluded}`,
            );
        } else {
          await trx(days_custom_hourly_rate)
            .where({ day_id: dayId.day_id })
            .del();
        }
      }

      if (key === requiredHours) {
        if (value !== "") {
          const customRequiredHours = {
            day_id: dayId.day_id,
            day_custom_required_hours: value,
          };
          await trx(days_custom_required_hours)
            .insert(customRequiredHours)
            .onConflict(day_id)
            .merge()
            .whereRaw(
              `${days_custom_required_hours} ${IS_DISTINCT_FROM_excluded}`,
            );
        } else {
          await trx(days_custom_required_hours)
            .where({ day_id: dayId.day_id })
            .del();
        }
      }

      if (key === isHoliday) {
        if (value === true) {
          const holiday = {
            day_id: dayId.day_id,
            is_holiday: value,
          };
          await trx(holidays)
            .insert(holiday)
            .onConflict(day_id)
            .merge()
            .whereRaw(`${holidays} ${IS_DISTINCT_FROM_excluded}`);
        } else {
          await trx(holidays).where({ day_id: dayId.day_id }).del();
        }
      }

      res.json(`${successfullyUpdated} ${key} date property.`);
    });
  } catch (err) {
    handleError(err, res);
  }
};
