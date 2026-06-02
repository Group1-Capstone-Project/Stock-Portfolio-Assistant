//this is where the user service is defined, it contains the functions to interact with the database for the user data
import { prisma } from "@/lib/prisma";

export const userService = {
  findById: async (id: string) => {
    return await prisma.user.findUnique({ where: { id } });
  },

  findByEmail: async (email: string) => {
    return await prisma.user.findUnique({ where: { email } });
  },

  create: async (data: { name?: string; email?: string }) => {
    return await prisma.user.create({ data });
  },

  update: async (id: string, data: { name?: string; email?: string }) => {
    return await prisma.user.update({ where: { id }, data });
  },

  remove: async (id: string) => {
    return await prisma.user.delete({ where: { id } });
  },
};