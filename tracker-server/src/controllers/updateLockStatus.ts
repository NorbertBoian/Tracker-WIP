import { Request, Response } from "express";
import { Knex } from "knex";
import {
  IS_DISTINCT_FROM_excluded,
  monthNumberType,
  months,
  months_input_disabled,
  month_id,
  month_number,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
  user_id,
  years,
  year_id,
  year_name,
} from "../constants";
import { handleError } from "../utils/handleError";
import { validateUpdateLockStatusRequestBody } from "../validations/validateUpdateLockStatusRequestBody";

interface IExpectedRequestBody {
  year: number;
  month: monthNumberType;
  inputDisabled: boolean;
}

type IResponseBody = string;

const successfullyUpdatedLockStatusMessage =
  `${successfullyUpdated} lock status.` as const;

export const updateLockStatus = async (
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

    const validData = validateUpdateLockStatusRequestBody(req.body);

    if (validData instanceof Error) throw validData;

    const { year, month, inputDisabled } = validData;

    await db.transaction(async (trx) => {
      const insertedYearIdResult = await trx(years)
        .insert({ user_id: userId, year_name: year }, [year_id])
        .onConflict([user_id, year_name])
        .ignore();

      const insertedYearId = insertedYearIdResult[0]
        ? insertedYearIdResult[0].year_id
        : undefined;
      let yearId = insertedYearId;

      if (insertedYearId === undefined) {
        const presentYearIdResult = await trx(years)
          .where({ user_id: userId, year_name: year })
          .select(year_id);
        const presentYearId = presentYearIdResult[0].year_id;
        yearId = presentYearId;
      }

      const insertedMonthIdResult = await trx(months)
        .insert({ year_id: yearId, month_number: month })
        .onConflict([year_id, month_number])
        .ignore()
        .returning(month_id);

      const insertedMonthId = insertedMonthIdResult[0]
        ? insertedMonthIdResult[0].month_id
        : undefined;
      let monthId = insertedMonthId;

      if (insertedMonthId === undefined) {
        const presentMonthIdResult = await trx(months)
          .where({ year_id: yearId, month_number: month })
          .select(month_id);
        const presentMonthId = presentMonthIdResult[0].month_id;
        monthId = presentMonthId;
      }
      if (inputDisabled === true) {
        await trx(months_input_disabled)
          .insert({ month_id: monthId, input_disabled: true })
          .onConflict(month_id)
          .merge()
          .whereRaw(`${months_input_disabled} ${IS_DISTINCT_FROM_excluded}`);
      } else {
        await trx(months_input_disabled).where({ month_id: monthId }).del();
      }
      res.status(204).send();
    });
  } catch (err) {
    handleError(err, res);
  }
};
