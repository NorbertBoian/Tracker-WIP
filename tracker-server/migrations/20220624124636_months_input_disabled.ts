import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("months_input_disabled", (table) => {
    table
      .integer("month_id")
      .references("month_id")
      .inTable("months")
      .primary();
    table.boolean("input_disabled").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months_input_disabled");
}
