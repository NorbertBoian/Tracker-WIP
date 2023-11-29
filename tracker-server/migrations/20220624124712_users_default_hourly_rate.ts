import { Knex } from "knex";
import { hourlyRateNoEmptyStringRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users_default_hourly_rate", (table) => {
    table.increments("entry_id");
    table.uuid("user_id").references("user_id").inTable("users").notNullable();
    table.string("user_default_hourly_rate", 6).notNullable();
    table.check(
      `user_default_hourly_rate ~ '${hourlyRateNoEmptyStringRegexDatabaseString}'`,
    );
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_default_hourly_rate");
}
