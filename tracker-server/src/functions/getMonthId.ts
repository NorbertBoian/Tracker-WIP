import { Knex } from "knex";
import {
  monthNumberType,
  months,
  month_id,
  month_number,
  unexpectedErrorOccurredMessage,
  year_id,
} from "../constants";
import { getYearId } from "./getYearId";

//Inserts year and month if don't exist
export const getMonthId = async (
  db: Knex,
  userId: string,
  year: number,
  month: monthNumberType,
) => {
  const yearId = await getYearId(db, userId, year);

  const insertedMonthIdResult = await db(months)
    .insert({ year_id: yearId, month_number: month }, [month_id])
    .onConflict([year_id, month_number])
    .ignore();

  const insertedMonthId = insertedMonthIdResult[0]
    ? insertedMonthIdResult[0].month_id
    : undefined;

  if (insertedMonthId !== undefined) return insertedMonthId;

  const presentMonthIdResult = await db(months)
    .where({ year_id: yearId, month_number: month })
    .select(month_id);

  const presentMonthId = presentMonthIdResult[0].month_id;

  if (presentMonthId !== undefined) return presentMonthId;

  throw new Error(unexpectedErrorOccurredMessage);
};
