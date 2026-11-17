import "dotenv/config"; // la CLI Prisma ne lit pas .env toute seule
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "node prisma/seed.js" },
  datasource: { url: env("DATABASE_URL") },
});
