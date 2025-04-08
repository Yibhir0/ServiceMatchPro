import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('drizzle-kit').Config} */
export default {
  schema: "./shared/schema.js",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  }
};