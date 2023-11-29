import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("months_custom_disabled_days", (table) => {
    table
      .integer("month_id")
      .references("month_id")
      .inTable("months")
      .primary();
    table.boolean("monday").notNullable();
    table.boolean("tuesday").notNullable();
    table.boolean("wednesday").notNullable();
    table.boolean("thursday").notNullable();
    table.boolean("friday").notNullable();
    table.boolean("saturday").notNullable();
    table.boolean("sunday").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months_custom_disabled_days");
}
