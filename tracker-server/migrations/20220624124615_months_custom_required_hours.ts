import { Knex } from "knex";
import { requiredHoursRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("months_custom_required_hours", (table) => {
    table
      .integer("month_id")
      .references("month_id")
      .inTable("months")
      .primary();
    table.string("monday", 2).notNullable();
    table.string("tuesday", 2).notNullable();
    table.string("wednesday", 2).notNullable();
    table.string("thursday", 2).notNullable();
    table.string("friday", 2).notNullable();
    table.string("saturday", 2).notNullable();
    table.string("sunday", 2).notNullable();
    table.check(`monday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`tuesday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`wednesday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`thursday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`friday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`saturday ~ '${requiredHoursRegexDatabaseString}'`);
    table.check(`sunday ~ '${requiredHoursRegexDatabaseString}'`);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months_custom_required_hours");
}
