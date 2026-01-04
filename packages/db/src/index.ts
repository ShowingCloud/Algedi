import { PrismaClient } from "@prisma/client";

export { PrismaClient };
export * from "@prisma/client";

// Singleton pattern for Prisma Client
let prisma: PrismaClient | undefined;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    });
  }
  return prisma;
}

// Export default instance
export default getPrismaClient();


