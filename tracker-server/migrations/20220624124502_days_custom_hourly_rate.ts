import { Knex } from "knex";
import { hourlyRateTrailingDecimalPointAllowedRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("days_custom_hourly_rate", (table) => {
    table.integer("day_id").references("day_id").inTable("days").primary();
    table.string("day_custom_hourly_rate", 6).notNullable();
    table.check(
      `day_custom_hourly_rate ~ '${hourlyRateTrailingDecimalPointAllowedRegexDatabaseString}'`,
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("days_custom_hourly_rate");
}
