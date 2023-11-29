import { Request, Response } from "express";
import { Knex } from "knex";
import {
  friday,
  monday,
  monthDoesntExistInDatabase,
  monthNumberType,
  months,
  months_custom_disabled_days,
  months_custom_hourly_rate,
  months_custom_overtime_multiplier,
  months_custom_required_hours,
  month_custom_hourly_rate,
  month_custom_overtime_multiplier,
  month_id,
  notLoggedInMessage,
  saturday,
  sunday,
  thursday,
  trueSendMessageErrorCause,
  tuesday,
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
      monthCustomHourlyRate: string;
      monthCustomOvertimeMultiplier: string;
      monthCustomRequiredHours: requiredHoursType;
      monthCustomDisabledDays: disabledDaysType;
    }
  | string;

const couldntGetCustomMonthSettings = "Couldn't get custom month settings";
const noMonthSettingsYet = "No month settings yet.";

export const getCustomMonthSettings = async (
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
        const monthIdResult = await trx(months)
          .where({ year_id: yearId, month_number: month })
          .select(month_id);
        const monthId = monthIdResult[0]
          ? monthIdResult[0].month_id
          : undefined;
        if (monthId) {
          const monthCustomHourlyRateResponse = await trx(
            months_custom_hourly_rate,
          )
            .where({ month_id: monthId })
            .select(month_custom_hourly_rate);

          if (monthCustomHourlyRateResponse.length === 0)
            throw new Error(noMonthSettingsYet, trueSendMessageErrorCause);

          const monthCustomOvertimeMultiplierResponse = await trx(
            months_custom_overtime_multiplier,
          )
            .where({ month_id: monthId })
            .select(month_custom_overtime_multiplier);
          const monthCustomRequiredHoursResponse = await trx(
            months_custom_required_hours,
          )
            .where({ month_id: monthId })
            .select(
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            );
          const monthCustomDisabledDaysResponse = await trx(
            months_custom_disabled_days,
          )
            .where({ month_id: monthId })
            .select(
              monday,
              tuesday,
              wednesday,
              thursday,
              friday,
              saturday,
              sunday,
            );

          const monthCustomHourlyRate =
            monthCustomHourlyRateResponse[0].month_custom_hourly_rate;
          const monthCustomOvertimeMultiplier =
            monthCustomOvertimeMultiplierResponse[0]
              .month_custom_overtime_multiplier;
          const monthCustomRequiredHours = monthCustomRequiredHoursResponse[0];
          const monthCustomDisabledDays = monthCustomDisabledDaysResponse[0];

          res.json({
            monthCustomHourlyRate,
            monthCustomOvertimeMultiplier,
            monthCustomRequiredHours,
            monthCustomDisabledDays,
          });
        } else {
          res.status(404).json(monthDoesntExistInDatabase);
        }
      } else {
        res.status(404).json(yearDoesntExistInDatabase);
      }
    });
  } catch (err) {
    handleError(err, res, couldntGetCustomMonthSettings);
  }
};
