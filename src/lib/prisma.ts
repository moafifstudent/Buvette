import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const pgPool =
  globalForPrisma.pgPool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

const adapter = new PrismaPg(pgPool);
const prismaLogLevels: Array<'query' | 'warn' | 'error'> =
  process.env.PRISMA_LOG_QUERIES === 'true'
    ? ['query', 'warn', 'error']
    : ['warn', 'error'];

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: prismaLogLevels,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pgPool = pgPool;
}
