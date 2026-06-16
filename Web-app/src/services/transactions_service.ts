import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { fetchQuote } from "@/lib/finnhub";

export const transactionservice = {

  // GET all transactions for this user
  findAllTransactions: async (userId: string) => {
    return await prisma.transaction.findMany({
      where: { userId }
    });
  },

  // GET one transaction for this user
  findOneTransaction: async (id: string, userId: string) => {
    return await prisma.transaction.findFirst({
      where: { id, userId }
    });
  },

  // CREATE transaction and update holding automatically
  createTransaction: async (
    userId: string, data: {
    ticker: string;
    shares: number;
    price: number;
    transactionType: TransactionType;
    transactionDate?: Date;
  }) => {
    const ticker = data.ticker?.trim().toUpperCase();

    if (!ticker) {
      throw new Error("Ticker is required");
    }

    if (!Number.isFinite(data.shares) || data.shares <= 0) {
      throw new Error("Shares must be greater than zero");
    }

    if (!Number.isFinite(data.price) || data.price <= 0) {
      throw new Error("Price must be greater than zero");
    }

    // For BUY orders, validate ticker against live quote lookup so fake symbols are rejected.
    if (data.transactionType === "BUY") {
      const quote = await fetchQuote(ticker);
      if (!quote) {
        throw new Error("Ticker not found");
      }
    }

    const existingHolding = await prisma.holding.findFirst({
      where: { userId, ticker }
    });

    if (data.transactionType === "BUY") {

      if (existingHolding) {
        // update existing holding
        const totalShares = Number(existingHolding.shares) + data.shares;
        const newAverage = (
          (Number(existingHolding.shares) * Number(existingHolding.averageBuyPrice)) +
          (data.shares * data.price)
        ) / totalShares;

        await prisma.holding.update({
          where: { id: existingHolding.id },
          data: {
            shares: totalShares,
            averageBuyPrice: newAverage
          }
        });

      } else {
        // create new holding
        await prisma.holding.create({
          data: {
            userId,
            ticker,
            shares: data.shares,
            averageBuyPrice: data.price
          }
        });
      }

    } else if (data.transactionType === "SELL") {

      if (!existingHolding) {
        throw new Error("Cannot sell a stock you do not own");
      }

      const remainingShares = Number(existingHolding.shares) - data.shares;

      if (remainingShares < 0) {
        throw new Error("Cannot sell more shares than you own");
      }

      if (remainingShares === 0) {
        // delete holding if no shares left
        await prisma.holding.delete({
          where: { id: existingHolding.id }
        });
      } else {
        // update holding with remaining shares
        await prisma.holding.update({
          where: { id: existingHolding.id },
          data: { shares: remainingShares }
        });
      }
    }

    // save the transaction record
    return await prisma.transaction.create({
      data: { ...data, ticker, userId }
    });
  },

  // DELETE a transaction
  deleteTransaction: async (id: string, userId: string) => {
    return await prisma.transaction.deleteMany({
      where: { id, userId }
    });
  },

};