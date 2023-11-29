import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users_default_disabled_days", (table) => {
    table.increments("entry_id");
    table.uuid("user_id").references("user_id").inTable("users").notNullable();
    table.boolean("monday").notNullable();
    table.boolean("tuesday").notNullable();
    table.boolean("wednesday").notNullable();
    table.boolean("thursday").notNullable();
    table.boolean("friday").notNullable();
    table.boolean("saturday").notNullable();
    table.boolean("sunday").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now()).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_default_disabled_days");
}
