import { Knex } from "knex";
import {
  unexpectedErrorOccurredMessage,
  user_id,
  years,
  year_id,
  year_name,
} from "../constants";

export const getYearId = async (db: Knex, userId: string, year: number) => {
  const insertedYearIdResult = await db(years)
    .insert({ user_id: userId, year_name: year }, [year_id])
    .onConflict([user_id, year_name])
    .ignore();

  const insertedYearId = insertedYearIdResult[0]
    ? insertedYearIdResult[0].year_id
    : undefined;
  if (insertedYearId !== undefined) return insertedYearId;

  const presentYearIdResult = await db(years)
    .where({ user_id: userId, year_name: year })
    .select(year_id);

  const presentYearId = presentYearIdResult[0].year_id;

  if (presentYearId !== undefined) return presentYearId;

  throw new Error(unexpectedErrorOccurredMessage);
};
