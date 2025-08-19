import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

declare global {
  var __db__: ReturnType<typeof drizzle> | undefined;
  var __sql__: ReturnType<typeof postgres> | undefined;
}

export function getDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!global.__sql__) {
    global.__sql__ = postgres(databaseUrl, {
      max: 10,
      prepare: true,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }

  if (!global.__db__) {
    global.__db__ = drizzle(global.__sql__, { schema });
  }

  return { db: global.__db__, sql: global.__sql__ } as const;
}


