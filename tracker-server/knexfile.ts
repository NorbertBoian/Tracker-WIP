import type { Knex } from "knex";
// import * as dotenv from "dotenv";

// dotenv.config();

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: process.env.DATABASE_URL,
  },
};

module.exports = config;
