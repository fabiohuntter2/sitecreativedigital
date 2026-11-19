import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import seed from "@/data/seed.json";
import type { Settings, TableMap, TableName } from "@/lib/types";
import type { DbDriver } from "./index";
import { sortRows } from "./index";

/**
 * Banco local em arquivo JSON (data/db.json).
 * Ideal para desenvolvimento e para hospedagem própria (VPS) com disco persistente.
 * Em hospedagens serverless (ex.: Vercel) use o Supabase.
 */
type Store = { settings: Partial<Settings> } & { [K in TableName]: TableMap[K][] };

const DB_PATH = process.env.LOCAL_DB_PATH
  ? path.resolve(/*turbopackIgnore: true*/ process.env.LOCAL_DB_PATH)
  : path.join(process.cwd(), "data", "db.json");

let queue: Promise<unknown> = Promise.resolve();
function serialize<R>(fn: () => Promise<R>): Promise<R> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

function initialStore(): Store {
  const now = new Date().toISOString();
  const stamp = <T extends object>(rows: T[]) => rows.map((r) => ({ ...r, created_at: now }));
  return {
    settings: seed.settings as Settings,
    services: stamp(seed.services) as unknown as Store["services"],
    portfolio: stamp(seed.portfolio) as unknown as Store["portfolio"],
    media: stamp(seed.media) as unknown as Store["media"],
    testimonials: stamp(seed.testimonials) as unknown as Store["testimonials"],
    quotes: [],
  };
}

async function write(store: Store) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  const tmp = `${DB_PATH}.${randomUUID()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  try {
    await fs.rename(tmp, DB_PATH);
  } catch (err) {
    // Windows pode recusar a troca se outro processo estiver lendo o arquivo — tenta de novo uma vez
    await new Promise((r) => setTimeout(r, 50));
    await fs.rename(tmp, DB_PATH).catch(async () => {
      await fs.rm(tmp, { force: true });
      throw err;
    });
  }
}

/** Cria o banco a partir do seed só uma vez, mesmo com várias leituras simultâneas. */
let initializing: Promise<Store> | null = null;

async function read(): Promise<Store> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as Store;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    initializing ??= (async () => {
      const store = initialStore();
      // "wx" falha se outro processo já criou o arquivo — nesse caso usamos o dele
      await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
      try {
        await fs.writeFile(DB_PATH, JSON.stringify(store, null, 2), { encoding: "utf8", flag: "wx" });
        return store;
      } catch (e) {
        if ((e as NodeJS.ErrnoException).code !== "EEXIST") throw e;
        return JSON.parse(await fs.readFile(DB_PATH, "utf8")) as Store;
      }
    })().finally(() => {
      initializing = null;
    });
    return initializing;
  }
}

let instance: DbDriver | null = null;

export function jsonDriver(): DbDriver {
  if (instance) return instance;
  instance = {
    mode: "local",
    async list(table) {
      const store = await read();
      return sortRows(table, (store[table] ?? []) as never);
    },
    async get(table, id) {
      const store = await read();
      return ((store[table] as { id: string }[]).find((r) => r.id === id) as never) ?? null;
    },
    async findBy(table, field, value) {
      const store = await read();
      return ((store[table] as Record<string, unknown>[]).find((r) => r[field] === value) as never) ?? null;
    },
    insert(table, data) {
      return serialize(async () => {
        const store = await read();
        const row = { ...data, id: randomUUID(), created_at: new Date().toISOString() };
        (store[table] as unknown[]).push(row);
        await write(store);
        return row as never;
      });
    },
    update(table, id, data) {
      return serialize(async () => {
        const store = await read();
        const rows = store[table] as { id: string }[];
        const idx = rows.findIndex((r) => r.id === id);
        if (idx < 0) throw new Error("Registro não encontrado");
        rows[idx] = { ...rows[idx], ...data, id };
        await write(store);
        return rows[idx] as never;
      });
    },
    remove(table, id) {
      return serialize(async () => {
        const store = await read();
        const rows = store[table] as { id: string }[];
        (store as unknown as Record<string, unknown>)[table] = rows.filter((r) => r.id !== id);
        await write(store);
      });
    },
    async getSettings() {
      const store = await read();
      return store.settings ?? null;
    },
    saveSettings(settings) {
      return serialize(async () => {
        const store = await read();
        store.settings = settings;
        await write(store);
      });
    },
  };
  return instance;
}
