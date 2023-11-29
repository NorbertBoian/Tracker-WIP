import { Knex } from "knex";
import { overtimeMultiplierTrailingDecimalPointAllowedRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("days_custom_overtime_multiplier", (table) => {
    table.integer("day_id").references("day_id").inTable("days").primary();
    table.string("day_custom_overtime_multiplier", 5).notNullable();
    table.check(
      `day_custom_overtime_multiplier ~ '${overtimeMultiplierTrailingDecimalPointAllowedRegexDatabaseString}'`,
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("days_custom_overtime_multiplier");
}
