import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("holidays", (table) => {
    table.integer("day_id").references("day_id").inTable("days").primary();
    table.boolean("is_holiday").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("holidays");
}
