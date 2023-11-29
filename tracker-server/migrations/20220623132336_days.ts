import { Knex } from "knex";

const dates = Array.from({ length: 31 }, (v, i) => i + 1);

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("days", (table) => {
    table.increments("day_id");
    table
      .integer("month_id")
      .references("month_id")
      .inTable("months")
      .notNullable();
    table
      .enu("date", dates, {
        useNative: true,
        enumName: "date_number",
      })
      .notNullable();
    table.boolean("holiday").defaultTo(false).notNullable();
    table.unique(["month_id", "date"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("days");
  await knex.raw("DROP TYPE public.date_number");
}
