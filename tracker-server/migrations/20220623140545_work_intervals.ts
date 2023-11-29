import { Knex } from "knex";
import { timeRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("work_intervals", (table) => {
    table.increments("interval_id");
    table.integer("day_id").references("day_id").inTable("days").notNullable();
    table.string("began", 5).defaultTo("").notNullable();
    table.string("ended", 5).defaultTo("").notNullable();
    table.check(`began ~ '${timeRegexDatabaseString}'`);
    table.check(`ended ~ '${timeRegexDatabaseString}'`);
    table.integer("interval_number").notNullable();
    table.unique(["day_id", "interval_number"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("work_intervals");
}
