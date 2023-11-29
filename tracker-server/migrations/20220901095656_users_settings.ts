import { Knex } from "knex";
import {
  displayedCurrencyRegexDatabaseString,
  languageCodes,
} from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users_settings", (table) => {
    table.uuid("user_id").references("user_id").inTable("users").primary();
    table.tinyint("autosave_interval").notNullable();
    table
      .enu("language_code", languageCodes, {
        useNative: true,
        enumName: "language_code",
      })
      .notNullable();
    table.check("autosave_interval >= 15");
    table.string("displayed_currency", 5).notNullable();
    table.check(
      `displayed_currency ~ '${displayedCurrencyRegexDatabaseString}'`,
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_settings");
  await knex.raw("DROP TYPE public.language_code");
}
