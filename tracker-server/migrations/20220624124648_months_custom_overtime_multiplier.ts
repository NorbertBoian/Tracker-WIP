import { Knex } from "knex";
import { overtimeMultiplierRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "months_custom_overtime_multiplier",
    (table) => {
      table
        .integer("month_id")
        .references("month_id")
        .inTable("months")
        .primary();
      table.string("month_custom_overtime_multiplier", 5).notNullable();
      table.check(
        `month_custom_overtime_multiplier ~ '${overtimeMultiplierRegexDatabaseString}'`,
      );
    },
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months_custom_overtime_multiplier");
}
