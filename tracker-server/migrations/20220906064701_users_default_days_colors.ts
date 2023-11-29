import { Knex } from "knex";
import { englishWeekdaysArray } from "../src/constants";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users_default_days_colors", (table) => {
    table.increments("color_id");
    table.uuid("user_id").references("user_id").inTable("users").notNullable();
    table
      .enu("day_name", englishWeekdaysArray, {
        useNative: true,
        enumName: "day_name",
      })
      .notNullable();
    table.tinyint("red").notNullable().checkBetween([0, 255]);
    table.tinyint("green").notNullable().checkBetween([0, 255]);
    table.tinyint("blue").notNullable().checkBetween([0, 255]);
    table.unique(["user_id", "day_name"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users_default_days_colors");
  await knex.raw("DROP TYPE public.day_name");
}
