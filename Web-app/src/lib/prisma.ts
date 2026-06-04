// prisma 7 requires a database adapter when using the standard Prisma Client
// creates one shared Prisma Client instance for the app

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// the adapter uses the DATABASE_URL from Web-app/.env.local to connect to Neon/PostgreSQL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: ["query", "error", "warn"],
  });

// keeps Prisma from creating too many clients during Next.js hot reloads in development
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;