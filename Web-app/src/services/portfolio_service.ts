import { prisma } from "@/lib/prisma";
import { fetchQuote } from "@/lib/finnhub";

export const portfolioService = {
  getPortfolio: async (userId: string) => {

    // get all holdings for this user
    const holdings = await prisma.holding.findMany({
      where: { userId }
    });

    if (holdings.length === 0) {
      return { holdings: [], totalValue: 0, totalProfitLoss: 0 };
    }

    // calculate profit/loss for each holding
    const holdingsWithStats = await Promise.all(
      holdings.map(async (holding) => {
        // get latest price from Finnhub
        const quote = await fetchQuote(holding.ticker);
        const latestPrice = quote?.currentPrice ?? Number(holding.latestPrice) ?? 0;
        const dayChange = quote?.change ?? 0;
        const dayChangePercent = quote?.percentChange ?? 0;

        const shares = Number(holding.shares);
        const averageBuyPrice = Number(holding.averageBuyPrice);

        const currentValue = latestPrice * shares;
        const profitLoss = (latestPrice - averageBuyPrice) * shares;
        const profitLossPercent = ((latestPrice - averageBuyPrice) / averageBuyPrice) * 100;

        return {
          ...holding,
          latestPrice,
          dayChange,
          dayChangePercent,
          currentValue,
          profitLoss,
          profitLossPercent: Math.round(profitLossPercent * 100) / 100
        };
      })
    );

    // calculate total portfolio value
    const totalValue = holdingsWithStats.reduce(
      (sum, h) => sum + h.currentValue, 0
    );

    // calculate total profit/loss
    const totalProfitLoss = holdingsWithStats.reduce(
      (sum, h) => sum + h.profitLoss, 0
    );

    return {
      holdings: holdingsWithStats,
      totalValue,
      totalProfitLoss
    };
  }
};