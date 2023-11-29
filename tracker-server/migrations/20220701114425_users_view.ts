import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createView("users_view", (view) => {
    view.as(
      knex
        .select(
          "u.username",
          "udhr.user_default_hourly_rate",
          { udhr_created_at: "udhr.created_at" },
          "udom.user_default_overtime_multiplier",
          { udom_created_at: "udom.created_at" },
          "udrh.monday",
          "udrh.tuesday",
          "udrh.wednesday",
          "udrh.thursday",
          "udrh.friday",
          "udrh.saturday",
          "udrh.sunday",
        )
        .from({ u: "users" })
        .innerJoin(
          { udom: "users_default_overtime_multiplier" },
          "u.user_id",
          "udom.user_id",
        )
        .innerJoin(
          { udhr: "users_default_hourly_rate" },
          "u.user_id",
          "udhr.user_id",
        )
        .innerJoin(
          { udrh: "users_default_required_hours" },
          "u.user_id",
          "udrh.user_id",
        ),
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropView("users_view");
}
