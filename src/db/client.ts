/**
 * Connexion à la base de données.
 * - Production : Postgres via DATABASE_URL (Neon, Supabase, Vercel Postgres…).
 * - Développement local : PGlite (Postgres embarqué), dans .data/pglite — aucun service à installer.
 * Les migrations (dossier drizzle/) s’appliquent automatiquement au premier accès,
 * puis le catalogue de départ est importé si la base est vide.
 */
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";
import { seedCatalog } from "./seed";

export type Db = PgDatabase<PgQueryResultHKT, typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");
const LOCK_KEY = 7_412_026;

async function connectPostgres(url: string): Promise<Db> {
  const { default: postgres } = await import("postgres");
  const { drizzle } = await import("drizzle-orm/postgres-js");
  const { migrate } = await import("drizzle-orm/postgres-js/migrator");
  // prepare: false — compatible avec les poolers en mode transaction (Supabase, Neon).
  const client = postgres(url, { max: Number(process.env.DATABASE_POOL_MAX ?? 5), prepare: false, onnotice: () => {} });
  const db = drizzle({ client, schema, casing: "snake_case" });

  // Migrations et import initial sur une connexion unique, sous verrou consultatif :
  // une seule instance les applique, les autres attendent puis constatent qu’il n’y a rien à faire.
  const setup = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    await setup`select pg_advisory_lock(${LOCK_KEY})`;
    const setupDb = drizzle({ client: setup, schema, casing: "snake_case" });
    await migrate(setupDb, { migrationsFolder: MIGRATIONS });
    await seedCatalog(setupDb as unknown as Db);
    await setup`select pg_advisory_unlock(${LOCK_KEY})`;
  } finally {
    await setup.end({ timeout: 5 });
  }
  return db as unknown as Db;
}

async function connectPglite(): Promise<Db> {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  // Pendant `next build`, plusieurs processus tournent en parallèle : base en mémoire, catalogue de départ.
  const inMemory = process.env.NEXT_PHASE === "phase-production-build" || process.env.PGLITE_DATA_DIR === "memory";
  const dataDir = inMemory ? undefined : path.resolve(/*turbopackIgnore: true*/ process.env.PGLITE_DATA_DIR ?? ".data/pglite");
  const client = new PGlite(dataDir);
  const db = drizzle({ client, schema, casing: "snake_case" });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  await seedCatalog(db as unknown as Db);
  return db as unknown as Db;
}

const globalForDb = globalThis as unknown as { __mkDb?: Promise<Db> };

/** Instance partagée (une par processus). */
export function getDb(): Promise<Db> {
  if (!globalForDb.__mkDb) {
    const url = process.env.DATABASE_URL;
    globalForDb.__mkDb = (url ? connectPostgres(url) : connectPglite()).catch((error) => {
      globalForDb.__mkDb = undefined;
      throw error;
    });
  }
  return globalForDb.__mkDb;
}

export { schema };
