import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createView("months_view", (view) => {
    view.as(
      knex
        .select(
          "u.username",
          "y.year_name",
          "m.month_number",
          { input_disabled: knex.raw("coalesce (mid.input_disabled,false)") },
          "mchr.month_custom_hourly_rate",
          "mcom.month_custom_overtime_multiplier",
          "mcrh.monday",
          "mcrh.tuesday",
          "mcrh.wednesday",
          "mcrh.thursday",
          "mcrh.friday",
          "mcrh.saturday",
          "mcrh.sunday",
        )
        .from({ u: "users" })
        .innerJoin({ y: "years" }, "u.user_id", "y.user_id")
        .innerJoin({ m: "months" }, "m.year_id", "y.year_id")
        .leftJoin(
          { mchr: "months_custom_hourly_rate" },
          "mchr.month_id",
          "m.month_id",
        )
        .leftJoin(
          { mcom: "months_custom_overtime_multiplier" },
          "mcom.month_id",
          "m.month_id",
        )
        .leftJoin(
          { mid: "months_input_disabled" },
          "mid.month_id",
          "m.month_id",
        )
        .leftJoin(
          { mcrh: "months_custom_required_hours" },
          "mcrh.month_id",
          "m.month_id",
        ),
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropView("months_view");
}
