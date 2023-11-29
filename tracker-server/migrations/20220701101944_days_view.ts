import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createView("days_view", (view) => {
    view.as(
      knex
        .select(
          "u.username",
          "y.year_name",
          "m.month_number",
          "d.date",
          "wi.began",
          "wi.ended",
          { holiday: knex.raw("coalesce (h.is_holiday,false)") },
          "dchr.day_custom_hourly_rate",
          "dcom.day_custom_overtime_multiplier",
          "dcrh.day_custom_required_hours",
        )
        .from({ u: "users" })
        .innerJoin({ y: "years" }, "u.user_id", "y.user_id")
        .innerJoin({ m: "months" }, "m.year_id", "y.year_id")
        .innerJoin({ d: "days" }, "d.month_id", "m.month_id")
        .innerJoin({ wi: "work_intervals" }, "wi.day_id", "d.day_id")
        .leftJoin({ h: "holidays" }, "h.day_id", "d.day_id")
        .leftJoin(
          { dchr: "days_custom_hourly_rate" },
          "d.day_id",
          "dchr.day_id",
        )
        .leftJoin(
          { dcom: "days_custom_overtime_multiplier" },
          "dcom.day_id",
          "d.day_id",
        )
        .leftJoin(
          { dcrh: "days_custom_required_hours" },
          "dcrh.day_id",
          "d.day_id",
        ),
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropView("days_view");
}
