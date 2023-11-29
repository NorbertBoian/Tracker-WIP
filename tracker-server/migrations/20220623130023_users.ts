import { Knex } from "knex";
// import { html5EmailRegexDatabaseString } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  // await knex.raw("CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public");

  await knex.schema.createTable("users", (table) => {
    table.uuid("user_id").defaultTo(knex.raw("gen_random_uuid()")).primary();
    table.string("username").notNullable().checkLength(">", 0);
    // table.specificType("email", "CITEXT").unique().notNullable();
    // .checkLength("<=", 320);
    // table.check(`email ~* '${html5EmailRegexDatabaseString}'`);
    table.string("email").notNullable();
    // table.string("counter").notNullable();
    table.string("password").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
  // await knex.raw("DROP EXTENSION IF EXISTS citext");
}
