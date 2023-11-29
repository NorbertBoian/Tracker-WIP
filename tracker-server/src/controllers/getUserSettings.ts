import { Request, Response } from "express";
import { Knex } from "knex";
import {
  autosave_interval,
  blue,
  created_at,
  day_name,
  desc,
  displayed_currency,
  friday,
  green,
  languageCodeType,
  language_code,
  monday,
  notLoggedInMessage,
  red,
  saturday,
  sunday,
  thursday,
  trueSendMessageErrorCause,
  tuesday,
  users_default_days_colors,
  users_default_disabled_days,
  users_default_hourly_rate,
  users_default_overtime_multiplier,
  users_default_required_hours,
  users_settings,
  user_default_hourly_rate,
  user_default_overtime_multiplier,
  wednesday,
} from "../constants";
import { disabledDaysType, requiredHoursType } from "../types/knex";
import { handleError } from "../utils/handleError";
import { userDefaultDaysColorsType } from "./updateUserSettings";

interface IExpectedRequestBody {
  year: number;
  month: number;
}

type IResponseBody =
  | {
      userDefaultHourlyRate: string;
      userDefaultOvertimeMultiplier: string;
      userDefaultRequiredHours: requiredHoursType;
      userDefaultDisabledDays: disabledDaysType;
      userDefaultDaysColors: userDefaultDaysColorsType;
      languageCode: languageCodeType;
      autosaveInterval: number | undefined;
      displayedCurrency: string;
    }
  | string;

const couldntGetUserSettings = "Couldn't get user settings.";
const noUserSettingsYet = "No users settings yet.";

export const getUserSettings = async (
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
    await db.transaction(async (trx) => {
      const userSettingsResponse = await trx(users_settings)
        .where({ user_id: userId })
        .select(autosave_interval, language_code, displayed_currency);

      if (userSettingsResponse.length === 0)
        throw new Error(noUserSettingsYet, trueSendMessageErrorCause);

      const userDefaultHourlyRateResponse = await trx(users_default_hourly_rate)
        .where({ user_id: userId })
        .orderBy(created_at, desc)
        .limit(1)
        .select(user_default_hourly_rate, created_at);
      const userDefaultOvertimeMultiplierResponse = await trx(
        users_default_overtime_multiplier,
      )
        .where({ user_id: userId })
        .orderBy(created_at, desc)
        .limit(1)
        .select(user_default_overtime_multiplier, created_at);
      const userDefaultRequiredHoursResponse = await trx(
        users_default_required_hours,
      )
        .where({ user_id: userId })
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
          created_at,
        );
      const userDefaultDaysColorsResponse = await trx(users_default_days_colors)
        .where({ user_id: userId })
        .select(day_name, red, green, blue);

      const userDefaultDisabledDaysResponse = await trx(
        users_default_disabled_days,
      )
        .where({ user_id: userId })
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
          created_at,
        );

      const userDefaultHourlyRate =
        userDefaultHourlyRateResponse[0].user_default_hourly_rate;
      const userDefaultOvertimeMultiplier =
        userDefaultOvertimeMultiplierResponse[0]
          .user_default_overtime_multiplier;

      const {
        created_at: userDefaultRequiredHoursCreatedAt,
        ...userDefaultRequiredHoursValues
      } = userDefaultRequiredHoursResponse[0];

      const userDefaultRequiredHours = userDefaultRequiredHoursValues;

      const {
        created_at: userDefaultDisabledDaysCreatedAt,
        ...userDefaultDisabledDaysValues
      } = userDefaultDisabledDaysResponse[0];

      const userDefaultDisabledDays = userDefaultDisabledDaysValues;

      const userDefaultDaysColors =
        userDefaultDaysColorsResponse.reduce<userDefaultDaysColorsType>(
          (acc, result) => {
            const { red, green, blue } = result;
            const dayColors = {
              [result.day_name]: [red, green, blue],
            };
            return { ...acc, ...dayColors };
          },
          {},
        );

      const {
        language_code: languageCode,
        autosave_interval: autosaveInterval,
        displayed_currency: displayedCurrency,
      } = userSettingsResponse[0];

      res.json({
        userDefaultHourlyRate,
        userDefaultOvertimeMultiplier,
        userDefaultRequiredHours,
        userDefaultDisabledDays,
        userDefaultDaysColors,
        languageCode,
        autosaveInterval,
        displayedCurrency,
      });
    });
  } catch (err) {
    handleError(err, res, couldntGetUserSettings);
  }
};
