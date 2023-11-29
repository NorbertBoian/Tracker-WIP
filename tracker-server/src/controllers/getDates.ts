import { Request, Response } from "express";
import { Knex } from "knex";
import {
  date,
  days_custom_hourly_rate,
  days_custom_overtime_multiplier,
  days_custom_required_hours,
  day_id,
  input_disabled,
  monthDoesntExistInDatabase,
  monthNumberType,
  months,
  months_input_disabled,
  month_id,
  notLoggedInMessage,
  trueSendMessageErrorCause,
  work_intervals,
  yearDoesntExistInDatabase,
  years,
  year_id,
} from "../constants";
import { Dates, getEmptyDatesArray } from "../utils/getEmptyDatesArray";
import { handleError } from "../utils/handleError";
import { validateYearAndMonthRequestBody } from "../validations/validateYearAndMonthRequestBody";

interface IExpectedRequestBody {
  year: number;
  month: monthNumberType;
}

type IResponseBody =
  | {
      inputDisabled: boolean;
      dates: Dates;
    }
  | string;

const couldntGetDates = "Couldn't get dates.";

export const getDates = async (
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

    const validData = validateYearAndMonthRequestBody(req.body);
    if (validData instanceof Error) throw validData;

    const { year, month } = validData;

    await db.transaction(async (trx) => {
      const dates = getEmptyDatesArray(year, month);
      const yearIdResult = await trx(years)
        .where({ user_id: userId, year_name: +year })
        .select(year_id);
      const yearId = yearIdResult[0] ? yearIdResult[0].year_id : undefined;
      if (yearId) {
        const monthIdResult = await trx(months)
          .where({ year_id: yearId, month_number: month })
          .select(month_id);
        const monthId = monthIdResult[0]
          ? monthIdResult[0].month_id
          : undefined;
        if (monthId) {
          const days = await trx("days")
            .where({ month_id: monthId })
            .select(day_id, date);

          const daysIDs = days.map((day) => day.day_id);
          const workIntervals = await trx(work_intervals).whereIn(
            day_id,
            daysIDs,
          );

          for (const interval of workIntervals) {
            const day = days.find((day) => day.day_id === interval.day_id);
            if (day) {
              dates[day.date].beganString = interval.began;
              dates[day.date].endedString = interval.ended;
            }
          }

          const customOvertimeMultipliers = await trx(
            days_custom_overtime_multiplier,
          ).whereIn(day_id, daysIDs);
          for (const customOvertimeMultiplier of customOvertimeMultipliers) {
            const day = days.find(
              (day) => day.day_id === customOvertimeMultiplier.day_id,
            );
            if (day) {
              dates[day.date].overtimeMultiplier =
                customOvertimeMultiplier.day_custom_overtime_multiplier;
            }
          }

          const customHourlyRates = await trx(days_custom_hourly_rate).whereIn(
            day_id,
            daysIDs,
          );
          for (const customHourlyRate of customHourlyRates) {
            const day = days.find(
              (day) => day.day_id === customHourlyRate.day_id,
            );
            if (day) {
              dates[day.date].hourlyRate =
                customHourlyRate.day_custom_hourly_rate;
            }
          }

          const customRequiredHours = await trx(
            days_custom_required_hours,
          ).whereIn(day_id, daysIDs);
          for (const customRequiredHour of customRequiredHours) {
            const day = days.find(
              (day) => day.day_id === customRequiredHour.day_id,
            );
            if (day) {
              dates[day.date].requiredHours =
                customRequiredHour.day_custom_required_hours;
            }
          }

          const holidays = await trx("holidays").whereIn(day_id, daysIDs);
          for (const holiday of holidays) {
            const day = days.find((day) => day.day_id === holiday.day_id);
            if (day) dates[day.date].isHoliday = holiday.is_holiday;
          }
          const inputDisabledLookup = await trx(months_input_disabled)
            .where({
              month_id: monthId,
            })
            .select(input_disabled);
          const inputDisabled =
            inputDisabledLookup[0] === undefined
              ? false
              : inputDisabledLookup[0].input_disabled;
          res.json({ dates, inputDisabled });
        } else {
          res.status(404).json(monthDoesntExistInDatabase);
        }
      } else {
        res.status(404).json(yearDoesntExistInDatabase);
      }
    });
  } catch (err) {
    handleError(err, res, couldntGetDates);
  }
};
