import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("years", (table) => {
    table.increments("year_id");
    table.uuid("user_id").references("user_id").inTable("users").notNullable();
    table.smallint("year_name").notNullable().checkBetween([1800, 9999]);
    table.unique(["user_id", "year_name"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("years");
}
