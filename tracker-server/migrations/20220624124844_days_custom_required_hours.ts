import { Knex } from "knex";
import { requiredHoursRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("days_custom_required_hours", (table) => {
    table.integer("day_id").references("day_id").inTable("days").primary();
    table.string("day_custom_required_hours", 2).notNullable();
    table.check(
      `day_custom_required_hours ~ '${requiredHoursRegexDatabaseString}'`,
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("days_custom_required_hours");
}
