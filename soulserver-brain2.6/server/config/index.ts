import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const isLocal = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: !isLocal && process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

console.log(`[Config] Infraestrutura inicializada em modo: ${process.env.APP_ENV || 'development'}`);
