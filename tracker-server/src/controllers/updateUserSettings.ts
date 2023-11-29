import { Request, Response } from "express";
import { Knex } from "knex";
import { UserDefaultDaysColors } from "knex/types/tables";
import {
  colorType,
  color_id,
  created_at,
  day_name,
  desc,
  englishWeekdaysArray,
  englishWeekdayType,
  entry_id,
  IS_DISTINCT_FROM_excluded,
  languageCodeType,
  months,
  notLoggedInMessage,
  successfullyUpdated,
  trueSendMessageErrorCause,
  users_default_days_colors,
  users_default_disabled_days,
  users_default_hourly_rate,
  users_default_overtime_multiplier,
  users_default_required_hours,
  users_settings,
  user_id,
  years,
  year_id,
} from "../constants";
import { disabledDaysType, requiredHoursType } from "../types/knex";
import { handleError } from "../utils/handleError";
import { validateUpdateUserSettingsRequestBody } from "../validations/validateUpdateUserSettingsRequestBody";

export type userDefaultDaysColorsType = Partial<{
  [weekday in englishWeekdayType]: [number, number, number];
}>;

export interface IExpectedRequestBody {
  userDefaultHourlyRate: string;
  userDefaultOvertimeMultiplier: string;
  userDefaultRequiredHours: requiredHoursType;
  userDefaultDisabledDays: disabledDaysType;
  userDefaultDaysColors: userDefaultDaysColorsType;
  languageCode: languageCodeType;
  autosaveInterval: number;
  displayedCurrency: string;
}

type IResponseBody = string;

const successfullyUpdatedUserSettingsMessage =
  `${successfullyUpdated} user settings.` as const;

export const updateUserSettings = async (
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
    await db.transaction(async (trx) => {
      if (!userId)
        throw new Error(notLoggedInMessage, {
          cause: { sendMessage: true, responseCode: 401 },
        });

      const validData = validateUpdateUserSettingsRequestBody(req.body);
      if (validData instanceof Error) throw validData;

      const {
        userDefaultHourlyRate,
        userDefaultOvertimeMultiplier,
        userDefaultRequiredHours,
        userDefaultDisabledDays,
        userDefaultDaysColors,
        languageCode,
        autosaveInterval,
        displayedCurrency,
      } = validData;

      const createdAt = db.fn.now();

      const userDayColors = [] as Omit<
        UserDefaultDaysColors,
        typeof color_id
      >[];
      const daysColorsToBeUpdated = [] as englishWeekdayType[];

      for (const weekday in userDefaultDaysColors) {
        const castedWeekday = weekday as keyof typeof userDefaultDaysColors;
        daysColorsToBeUpdated.push(castedWeekday);
        userDayColors.push({
          user_id: userId,
          day_name: castedWeekday,
          red: Math.round(
            (userDefaultDaysColors[castedWeekday] as colorType)[0],
          ),
          green: Math.round(
            (userDefaultDaysColors[castedWeekday] as colorType)[1],
          ),
          blue: Math.round(
            (userDefaultDaysColors[castedWeekday] as colorType)[2],
          ),
        });
      }
      const daysColorsToBeDeleted = englishWeekdaysArray.filter(
        (dayName) => !daysColorsToBeUpdated.includes(dayName),
      );

      if (userDayColors.length > 0) {
        await trx(users_default_days_colors)
          .insert(userDayColors)
          .onConflict([user_id, day_name])
          .merge()
          .whereRaw(
            `${users_default_days_colors} ${IS_DISTINCT_FROM_excluded}`,
          );
      }

      await trx(users_default_days_colors)
        .whereIn(day_name, daysColorsToBeDeleted)
        .andWhere({ user_id: userId })
        .del();

      await trx(users_settings)
        .insert({
          user_id: userId,
          language_code: languageCode,
          autosave_interval: autosaveInterval,
          displayed_currency: displayedCurrency,
        })
        .onConflict([user_id])
        .merge()
        .whereRaw(`${users_settings} ${IS_DISTINCT_FROM_excluded}`);

      const userYearsIdsResult = await trx(years)
        .where({ [user_id]: userId })
        .select(year_id);
      const userYearsIds = userYearsIdsResult.map((year) => year.year_id);

      const lastInsertedMonthCreationDateResult = await trx(months)
        .whereIn(year_id, userYearsIds)
        .orderBy(created_at, desc)
        .limit(1)
        .select(created_at);

      const lastInsertedMonthCreationDate =
        lastInsertedMonthCreationDateResult.length > 0
          ? lastInsertedMonthCreationDateResult[0].created_at
          : undefined;

      if (lastInsertedMonthCreationDate) {
        const defaultUserHourlyRatesSinceLastInsertedMonthResult = await trx(
          users_default_hourly_rate,
        )
          .where({ user_id: userId })
          .andWhere(created_at, ">", lastInsertedMonthCreationDate)
          .select(entry_id);

        const defaultUserOvertimeMultipliersSinceLastInsertedMonthResult =
          await trx(users_default_overtime_multiplier)
            .where({ user_id: userId })
            .andWhere(created_at, ">", lastInsertedMonthCreationDate)
            .select(entry_id);

        const defaultUserRequiredHoursSinceLastInsertedMonthResult = await trx(
          users_default_required_hours,
        )
          .where({ user_id: userId })
          .andWhere(created_at, ">", lastInsertedMonthCreationDate)
          .select(entry_id);

        const defaultUserDisabledDaysSinceLastInsertedMonthResult = await trx(
          users_default_disabled_days,
        )
          .where({ user_id: userId })
          .andWhere(created_at, ">", lastInsertedMonthCreationDate)
          .select(entry_id);

        const defaultUserHourlyRatesSinceLastInsertedMonth =
          defaultUserHourlyRatesSinceLastInsertedMonthResult.map(
            (hourlyRate) => hourlyRate.entry_id,
          );

        const defaultUserOvertimeMultipliersSinceLastInsertedMonth =
          defaultUserOvertimeMultipliersSinceLastInsertedMonthResult.map(
            (overtimeMultiplier) => overtimeMultiplier.entry_id,
          );

        const defaultUserRequiredHoursSinceLastInsertedMonth =
          defaultUserRequiredHoursSinceLastInsertedMonthResult.map(
            (requiredHours) => requiredHours.entry_id,
          );

        const defaultUserDisabledDaysSinceLastInsertedMonth =
          defaultUserDisabledDaysSinceLastInsertedMonthResult.map(
            (disabledDays) => disabledDays.entry_id,
          );

        await trx(users_default_hourly_rate)
          .whereIn(entry_id, defaultUserHourlyRatesSinceLastInsertedMonth)
          .del();
        await trx(users_default_overtime_multiplier)
          .whereIn(
            entry_id,
            defaultUserOvertimeMultipliersSinceLastInsertedMonth,
          )
          .del();
        await trx(users_default_required_hours)
          .whereIn(entry_id, defaultUserRequiredHoursSinceLastInsertedMonth)
          .del();
        await trx(users_default_disabled_days)
          .whereIn(entry_id, defaultUserDisabledDaysSinceLastInsertedMonth)
          .del();
      }

      await trx(users_default_overtime_multiplier).insert({
        user_id: userId,
        user_default_overtime_multiplier: userDefaultOvertimeMultiplier,
        created_at: createdAt,
      });

      await trx(users_default_hourly_rate).insert({
        user_id: userId,
        user_default_hourly_rate: userDefaultHourlyRate,
        created_at: createdAt,
      });

      await trx(users_default_required_hours).insert({
        user_id: userId,
        ...userDefaultRequiredHours,
        created_at: createdAt,
      });
      await trx(users_default_disabled_days).insert({
        user_id: userId,
        ...userDefaultDisabledDays,
        created_at: createdAt,
      });

      res.status(204).send();
    });
  } catch (err) {
    handleError(err, res);
  }
};
