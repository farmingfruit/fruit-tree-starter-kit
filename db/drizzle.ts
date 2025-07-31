import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

config({ path: ".env.local" });

const sqlite = new Database(process.env.DATABASE_URL!.replace('file:', ''));
export const db = drizzle(sqlite);
