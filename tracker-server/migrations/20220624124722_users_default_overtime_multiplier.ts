import { Knex } from "knex";
import { overtimeMultiplierNoEmptyStringRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "users_default_overtime_multiplier",
    (table) => {
      table.increments("entry_id");
      table
        .uuid("user_id")
        .references("user_id")
        .inTable("users")
        .notNullable();
      table.string("user_default_overtime_multiplier", 5).notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
      table.check(
        `user_default_overtime_multiplier ~ '${overtimeMultiplierNoEmptyStringRegexDatabaseString}'`,
      );
    },
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_default_overtime_multiplier");
}
