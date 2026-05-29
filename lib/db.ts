import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }

  const adapter = new PrismaPg({ connectionString: databaseUrl });

  return new PrismaClient({ adapter });
}

const prismaProxy = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalThis.__prisma) {
      globalThis.__prisma = createPrismaClient();
    }

    const value = globalThis.__prisma[prop as keyof PrismaClient];

    if (typeof value === "function") {
      return (...args: unknown[]) => (value as (...args: unknown[]) => unknown).apply(globalThis.__prisma, args);
    }

    return value;
  },
});

export const db = prismaProxy;
