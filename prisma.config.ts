import { defineConfig } from "prisma/config";
import { config } from "dotenv";

// Load .env so process.env is populated when this config file is evaluated
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // DIRECT_URL bypasses pgBouncer for migrations; falls back to DATABASE_URL
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
