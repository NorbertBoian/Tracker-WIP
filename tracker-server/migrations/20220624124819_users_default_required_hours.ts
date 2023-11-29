import { Knex } from "knex";
import { requiredHoursNoEmptyStringRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users_default_required_hours", (table) => {
    table.increments("entry_id");
    table.uuid("user_id").references("user_id").inTable("users").notNullable();
    table.string("monday", 2).notNullable();
    table.string("tuesday", 2).notNullable();
    table.string("wednesday", 2).notNullable();
    table.string("thursday", 2).notNullable();
    table.string("friday", 2).notNullable();
    table.string("saturday", 2).notNullable();
    table.string("sunday", 2).notNullable();
    table.check(`monday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`);
    table.check(`tuesday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`);
    table.check(
      `wednesday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`,
    );
    table.check(
      `thursday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`,
    );
    table.check(`friday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`);
    table.check(
      `saturday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`,
    );
    table.check(`sunday ~ '${requiredHoursNoEmptyStringRegexDatabaseString}'`);
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_default_required_hours");
}
