import { PrismaClient } from "@/lib/generated/prisma";
import { singleton } from "@/lib/singleton";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", () => new PrismaClient());
prisma.$connect();

export { prisma };
