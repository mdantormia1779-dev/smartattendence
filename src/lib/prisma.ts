import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, PoolConfig } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

const rawConnectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/smartattendence?schema=public";

// Clean connection string for Node pg pool compatibility
const connectionString = rawConnectionString
  .replace(/([?&])channel_binding=[^&]*(&|$)/g, "$1")
  .replace(/[?&]$/, "");

const isSslNeeded =
  connectionString.includes("neon.tech") ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=verify-full");

const poolConfig: PoolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
  ...(isSslNeeded ? { ssl: { rejectUnauthorized: false } } : {}),
};

const pool = globalForPrisma.pool ?? new Pool(poolConfig);
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
  globalForPrisma.prisma = prisma;
}

export default prisma;