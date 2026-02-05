import "server-only";

import { neonConfig, Pool as NeonPool } from "@neondatabase/serverless";
import { drizzle as drizzleNeonServerless, type NeonDatabase } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleNodePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import ws from "ws";

import * as schema from "./schema";

export { schema };

type Db = NeonDatabase<typeof schema> | NodePgDatabase<typeof schema>;

let _db: Db | null = null;
let _pool: Pool | null = null;
let _neonPool: NeonPool | null = null;

function isLocalPostgres(url: string) {
  try {
    const u = new URL(url);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function getDb() {
  if (_db) return _db;

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  if (isLocalPostgres(url)) {
    _pool ??= new Pool({ connectionString: url });
    _db = drizzleNodePg(_pool, { schema });
    return _db;
  }

  // Neon serverless driver supports transactions; neon-http does not.
  neonConfig.webSocketConstructor = ws;
  _neonPool ??= new NeonPool({ connectionString: url });
  _db = drizzleNeonServerless(_neonPool, { schema });
  return _db;
}

