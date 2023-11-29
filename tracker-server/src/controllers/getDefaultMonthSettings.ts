import { Request, Response } from "express";
import { Knex } from "knex";
import {
  created_at,
  desc,
  friday,
  monday,
  monthDoesntExistInDatabase,
  monthNumberType,
  months,
  month_id,
  notLoggedInMessage,
  saturday,
  sunday,
  thursday,
  trueSendMessageErrorCause,
  tuesday,
  users_default_disabled_days,
  users_default_hourly_rate,
  users_default_overtime_multiplier,
  users_default_required_hours,
  user_default_hourly_rate,
  user_default_overtime_multiplier,
  wednesday,
  yearDoesntExistInDatabase,
  years,
  year_id,
} from "../constants";
import { disabledDaysType, requiredHoursType } from "../types/knex";
import { handleError } from "../utils/handleError";
import { validateYearAndMonthRequestBody } from "../validations/validateYearAndMonthRequestBody";

interface IExpectedRequestBody {
  year: number;
  month: monthNumberType;
}

type IResponseBody =
  | {
      monthDefaultHourlyRate: string;
      monthDefaultOvertimeMultiplier: string;
      monthDefaultRequiredHours: requiredHoursType;
      monthDefaultDisabledDays: disabledDaysType;
    }
  | string;

const couldntGetDefaultMonthSettings = "Couldn't get default month settings";

export const getDefaultMonthSettings = async (
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
      const yearIdResult = await trx(years)
        .where({ user_id: userId, year_name: year })
        .select(year_id);
      const yearId = yearIdResult[0] ? yearIdResult[0].year_id : undefined;
      if (yearId) {
        const monthCreatedAtResult = await trx(months)
          .where({ year_id: yearId, month_number: month })
          .select(month_id, created_at);
        const monthCreatedAt = monthCreatedAtResult[0]
          ? monthCreatedAtResult[0].created_at
          : undefined;
        if (monthCreatedAt) {
          const monthDefaultHourlyRateResponse = await trx(
            users_default_hourly_rate,
          )
            .where({ user_id: userId })
            .andWhere(created_at, "<=", monthCreatedAt)
            .orderBy(created_at, desc)
            .limit(1)
            .select(user_default_hourly_rate);

          const monthDefaultOvertimeMultiplierResponse = await trx(
            users_default_overtime_multiplier,
          )
            .where({ user_id: userId })
            .andWhere(created_at, "<=", monthCreatedAt)
            .orderBy(created_at, desc)
            .limit(1)
            .select(user_default_overtime_multiplier);

          const monthDefaultRequiredHoursResponse = await trx(
            users_default_required_hours,
          )
            .where({ user_id: userId })
            .andWhere(created_at, "<=", monthCreatedAt)
            .orderBy(created_at, desc)
            .limit(1)
            .select(
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            );
          const monthDefaultDisabledDaysResponse = await trx(
            users_default_disabled_days,
          )
            .where({ user_id: userId })
            .andWhere(created_at, "<=", monthCreatedAt)
            .orderBy(created_at, "desc")
            .limit(1)
            .select(
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            );

          const monthDefaultHourlyRate =
            monthDefaultHourlyRateResponse[0].user_default_hourly_rate;
          const monthDefaultOvertimeMultiplier =
            monthDefaultOvertimeMultiplierResponse[0]
              .user_default_overtime_multiplier;
          const monthDefaultRequiredHours =
            monthDefaultRequiredHoursResponse[0];
          const monthDefaultDisabledDays = monthDefaultDisabledDaysResponse[0];

          res.json({
            monthDefaultHourlyRate,
            monthDefaultOvertimeMultiplier,
            monthDefaultRequiredHours,
            monthDefaultDisabledDays,
          });
        } else {
          res.status(404).json(monthDoesntExistInDatabase);
        }
      } else {
        res.status(404).json(yearDoesntExistInDatabase);
      }
    });
  } catch (err) {
    handleError(err, res, couldntGetDefaultMonthSettings);
  }
};
