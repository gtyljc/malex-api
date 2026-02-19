import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig(
    {
        schema: "./src/lib/prisma/schema.prisma",
        typedSql: {
            path: "./src/lib/prisma/sql"
        },
        migrations: { 
            path: "./src/lib/prisma/migrations",
            seed: "npx tsx ./src/lib/prisma/seed.ts",
        },
        datasource: { 
            url: env("DATABASE_URL") 
        }
    }
);