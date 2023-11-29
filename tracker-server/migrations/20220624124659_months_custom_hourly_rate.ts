import { Knex } from "knex";
import { hourlyRateRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("months_custom_hourly_rate", (table) => {
    table
      .integer("month_id")
      .references("month_id")
      .inTable("months")
      .primary();
    table.string("month_custom_hourly_rate", 6).notNullable();
    table.check(
      `month_custom_hourly_rate ~ '${hourlyRateRegexDatabaseString}'`,
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months_custom_hourly_rate");
}
