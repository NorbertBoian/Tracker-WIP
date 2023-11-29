import { Knex } from "knex";

const monthNumbers = Array.from({ length: 12 }, (v, i) => i);

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("months", (table) => {
    table.increments("month_id");
    table
      .integer("year_id")
      .references("year_id")
      .inTable("years")
      .notNullable();
    table
      .enu("month_number", monthNumbers, {
        useNative: true,
        enumName: "month_number",
      })
      .notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
    table.unique(["year_id", "month_number"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("months");
  await knex.raw("DROP TYPE public.month_number");
}
