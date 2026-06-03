//this service is responsible for interacting with the database to perform CRUD operations on the holdings data. It uses Prisma as the ORM to communicate with the database and provides methods for finding, creating, updating, and deleting holdings based on the user ID and holding ID. The service ensures that all operations are scoped to the authenticated user, preventing unauthorized access to other users' holdings.
import { prisma } from "@/lib/prisma";

export const holdingservice = {

  // GET all holdings of this user only
  findAll: async (userId: string) => {
    return await prisma.holding.findMany({
      where: { userId }
    });
  },

  // GET one holding of this user
  findOne: async (id: string, userId: string) => {
    return await prisma.holding.findFirst({
      where: { 
        id,
        userId
      }
    });
  },

  // CREATE a holding for this user
  create: async (userId: string, data: {
    ticker: string;
    shares: number;
    averageBuyPrice: number;
  }) => {
    return await prisma.holding.create({
      data: {
        ...data,
        userId
      }
    });
  },

  // UPDATE only if the holding belongs to the user
  update: async (id: string, userId: string, data: {
    shares?: number;
    averageBuyPrice?: number;
    latestPrice?: number;
  }) => {
    return await prisma.holding.updateMany({
      where: { 
        id,
        userId
      },
      data
    });
  },

  // DELETE only if the holding belongs to the user
  remove: async (id: string, userId: string) => {
    return await prisma.holding.deleteMany({
      where: { 
        id,
        userId
      }
    });
  },

};