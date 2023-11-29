import { Request, Response } from "express";
import { Knex } from "knex";
import {
  IS_DISTINCT_FROM_excluded,
  monthNumberType,
  months_custom_disabled_days,
  months_custom_hourly_rate,
  months_custom_overtime_multiplier,
  months_custom_required_hours,
  month_id,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
} from "../constants";
import { getMonthId } from "../functions/getMonthId";
import { disabledDaysType, requiredHoursType } from "../types/knex";
import { handleError } from "../utils/handleError";
import { validateUpdateCustomMonthSettingsRequestBody } from "../validations/validateUpdateCustomMonthSettingsRequestBody";

interface IExpectedRequestBody {
  customMonthSettings: {
    monthCustomHourlyRate: string;
    monthCustomOvertimeMultiplier: string;
    monthCustomRequiredHours: requiredHoursType;
    monthCustomDisabledDays: disabledDaysType;
  };
  year: number;
  month: monthNumberType;
}

type IResponseBody = string;

const successfullyUpdatedMonthSettings =
  `${successfullyUpdated} month settings.` as const;

export const updateCustomMonthSettings = async (
  req: Request<
    { [key: string]: string },
    IResponseBody,
    { [key: string]: unknown }
  >,
  res: Response<IResponseBody>,
  db: Knex,
) => {
  try {
    await db.transaction(async (trx) => {
      const { userId } = req.session;
      if (!userId)
        throw new Error(notLoggedInMessage, {
          cause: { sendMessage: true, responseCode: 401 },
        });

      const validData = validateUpdateCustomMonthSettingsRequestBody(req.body);
      if (validData instanceof Error) throw validData;

      const { customMonthSettings, year, month } = validData;

      const {
        monthCustomHourlyRate,
        monthCustomOvertimeMultiplier,
        monthCustomRequiredHours,
        monthCustomDisabledDays,
      } = customMonthSettings;

      const monthId = await getMonthId(trx, userId, year, month);

      await trx(months_custom_overtime_multiplier)
        .insert({
          month_id: monthId,
          month_custom_overtime_multiplier: monthCustomOvertimeMultiplier,
        })
        .onConflict(month_id)
        .merge().whereRaw(`
          ${months_custom_overtime_multiplier} ${IS_DISTINCT_FROM_excluded}`);

      await trx(months_custom_hourly_rate)
        .insert({
          month_id: monthId,
          month_custom_hourly_rate: monthCustomHourlyRate,
        })
        .onConflict(month_id)
        .merge().whereRaw(`
        ${months_custom_hourly_rate} ${IS_DISTINCT_FROM_excluded}`);

      await trx(months_custom_required_hours)
        .insert({
          month_id: monthId,
          ...monthCustomRequiredHours,
        })
        .onConflict(month_id)
        .merge().whereRaw(`
        ${months_custom_required_hours} ${IS_DISTINCT_FROM_excluded}`);

      await trx(months_custom_disabled_days)
        .insert({
          month_id: monthId,
          ...monthCustomDisabledDays,
        })
        .onConflict(month_id)
        .merge().whereRaw(`
        ${months_custom_disabled_days} ${IS_DISTINCT_FROM_excluded}`);

      res.status(204).send();
    });
  } catch (err) {
    handleError(err, res);
  }
};
