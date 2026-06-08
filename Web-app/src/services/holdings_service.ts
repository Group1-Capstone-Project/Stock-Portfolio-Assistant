import { prisma } from "@/lib/prisma";

export const holdingService = {

  // GET all holdings of this user
  findAll: async (userId: string) => {
    return await prisma.holding.findMany({
      where: { userId }
    });
  },

  // GET one holding of this user
  findOne: async (id: string, userId: string) => {
    return await prisma.holding.findFirst({
      where: { id, userId }
    });
  },

  // UPDATE latest price from Finnhub
  updateLatestPrice: async (id: string, userId: string, latestPrice: number) => {
    return await prisma.holding.updateMany({
      where: { id, userId },
      data: { 
        latestPrice,
        latestPriceAt: new Date()
      }
    });
  },

};