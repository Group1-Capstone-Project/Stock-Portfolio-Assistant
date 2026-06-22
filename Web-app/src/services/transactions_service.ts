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
    holdingId?: string;
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
// set restrictions on the data
    if (data.shares > 10000) {
      throw new Error("Shares cannot exceed 10,000 per transaction");
    }

    if (data.price > 1000000) {
      throw new Error("Price per share cannot exceed $1,000,000");
    }

    if (data.transactionDate && new Date(data.transactionDate) > new Date()) {
      throw new Error("Transaction date cannot be in the future");
    }

    // For BUY orders, validate ticker against live quote lookup so fake symbols are rejected.
    if (data.transactionType === "BUY") {
      const quote = await fetchQuote(ticker);
      if (!quote) {
        throw new Error("Ticker not found");
      }
    }
    
    if (data.transactionType === "BUY") {
      // check if identical transaction are created in last 5 seconds
      const recentDuplicate = await prisma.transaction.findFirst({
        where: {
          userId,
          ticker,
          shares: data.shares,
          price: data.price,
          transactionType: "BUY",
          createdAt: {
            gte: new Date(Date.now() - 5000)
          }
        }
      });

      if (recentDuplicate) {
        throw new Error("Duplicate transaction detected");
      }

      await prisma.holding.create({
        data: {
          userId,
          ticker,
          shares: data.shares,
          averageBuyPrice: data.price,
          purchaseDate: data.transactionDate  //saves the users chosen date
            ? new Date(data.transactionDate)
            : new Date()
        }
      });

    } else if (data.transactionType === "SELL") {

      const existingHolding = await prisma.holding.findFirst({
        where: { 
          id: data.holdingId,
          userId
       }
    });

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
      data: { 
      ticker,
      userId,
      shares: data.shares,
      price: data.price,
      transactionType: data.transactionType,
      transactionDate: data.transactionDate 
        ? new Date(data.transactionDate) 
        : new Date()
      }
    });
  },

  // DELETE a transaction
  deleteTransaction: async (id: string, userId: string) => {
    return await prisma.transaction.deleteMany({
      where: { id, userId }
    });
  },

};