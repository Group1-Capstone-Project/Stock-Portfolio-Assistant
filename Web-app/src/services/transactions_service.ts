import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { fetchQuote } from "@/lib/finnhub";

type TransactionInput = {
  ticker: string;
  shares: number;
  price: number;
  transactionType: TransactionType;
  transactionDate?: Date | string;
  holdingId?: string;
};

export const transactionservice = {
  findAllTransactions: async (userId: string) => {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: "desc" },
    });
  },

  findOneTransaction: async (id: string, userId: string) => {
    return prisma.transaction.findFirst({
      where: { id, userId },
    });
  },

  createTransaction: async (userId: string, data: TransactionInput) => {
    const ticker = data.ticker?.trim().toUpperCase();
    const transactionDate = data.transactionDate
      ? new Date(data.transactionDate)
      : new Date();

    if (!ticker) {
      throw new Error("Ticker is required");
    }

    if (!["BUY", "SELL"].includes(data.transactionType)) {
      throw new Error("Transaction type must be BUY or SELL");
    }

    if (!Number.isFinite(data.shares) || data.shares <= 0) {
      throw new Error("Shares must be greater than zero");
    }

    if (!Number.isFinite(data.price) || data.price <= 0) {
      throw new Error("Price must be greater than zero");
    }

    if (data.shares > 10000) {
      throw new Error("Shares cannot exceed 10,000 per transaction");
    }

    if (data.price > 1000000) {
      throw new Error("Price per share cannot exceed $1,000,000");
    }

    if (Number.isNaN(transactionDate.getTime())) {
      throw new Error("Transaction date is invalid");
    }

    if (transactionDate.getTime() > Date.now()) {
      throw new Error("Transaction date cannot be in the future");
    }

    if (data.transactionType === "BUY") {
      const quote = await fetchQuote(ticker);

      if (!quote) {
        throw new Error("Ticker not found");
      }
    }

    // Updating the holding and creating its transaction must either both
    // succeed or both fail, so they are performed in one database transaction.
    return prisma.$transaction(async (tx) => {
      if (data.transactionType === "BUY") {
        const holding = await tx.holding.create({
          data: {
            userId,
            ticker,
            shares: data.shares,
            averageBuyPrice: data.price,
            purchaseDate: transactionDate,
          },
        });

        return tx.transaction.create({
          data: {
            userId,
            holdingId: holding.id,
            ticker,
            shares: data.shares,
            price: data.price,
            transactionType: "BUY",
            transactionDate,
          },
        });
      }

      if (!data.holdingId) {
        throw new Error("Holding ID is required when selling");
      }

      const holding = await tx.holding.findFirst({
        where: {
          id: data.holdingId,
          userId,
        },
      });

      if (!holding) {
        throw new Error("Holding not found");
      }

      if (holding.ticker !== ticker) {
        throw new Error("Holding does not match the requested ticker");
      }

      const remainingShares = Number(holding.shares) - data.shares;

      if (remainingShares < 0) {
        throw new Error("Cannot sell more shares than you own");
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          holdingId: holding.id,
          ticker,
          shares: data.shares,
          price: data.price,
          transactionType: "SELL",
          transactionDate,
        },
      });

      if (remainingShares === 0) {
        await tx.holding.delete({
          where: { id: holding.id },
        });
      } else {
        await tx.holding.update({
          where: { id: holding.id },
          data: { shares: remainingShares },
        });
      }

      return transaction;
    });
  },

  deleteTransaction: async (id: string, userId: string) => {
    return prisma.transaction.deleteMany({
      where: { id, userId },
    });
  },
};