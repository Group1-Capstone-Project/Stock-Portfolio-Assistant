"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/types/portfolio";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import HoldingsTable from "@/components/Dashboard/HoldingsTable";
import AddHoldingForm from "@/components/Dashboard/AddHoldingForm";
import PortfolioChart from "@/components/Dashboard/PortfolioChart";
import PortfolioHistoryChart from "@/components/Dashboard/PortfolioHistoryChart";
import { holdings as mockHoldings } from "@/data/mockPortfolio";

// this helper calls our own backend route at /api/quote/batch
// the frontend does not call Finnhub directly
import { getBatchQuotes, isValidQuote } from "@/lib/stockApi";

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>(mockHoldings);

  // tracks whether the dashboard is currently refreshing stock prices
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  // stores an error message if quote retrieval fails
  const [priceError, setPriceError] = useState<string | null>(null);

  // when the dashboard first loads, this requests updated prices for the
  // current mock holdings and replaces the temporary hardcoded price values
  useEffect(() => {
    async function refreshPrices() {
      const symbols = holdings.map((holding) => holding.ticker);

      if (symbols.length === 0) {
        return;
      }

      try {
        setIsRefreshingPrices(true);
        setPriceError(null);

        const quotes = await getBatchQuotes(symbols);

        setHoldings((currentHoldings) =>
          currentHoldings.map((holding) => {
            const quote = quotes.find(
              (item) => item.symbol === holding.ticker && isValidQuote(item)
            );

            // if the API does not return a valid quote for this ticker,
            // keep the existing holding unchanged so the dashboard still works
            if (!quote || !isValidQuote(quote)) {
              return holding;
            }

            // replace the temporary mock current price with the latest price
            // returned by the backend Finnhub route
            return {
              ...holding,
              price: quote.currentPrice,
            };
          })
        );
      } catch {
        setPriceError("Unable to refresh stock prices right now.");
      } finally {
        setIsRefreshingPrices(false);
      }
    }

    refreshPrices();
  }, []);

  function addHolding(newHolding: Holding) {
    setHoldings((currentHoldings) => [...currentHoldings, newHolding]);
  }

  function deleteHolding(id: string) {
    setHoldings((currentHoldings) =>
      currentHoldings.filter((holding) => holding.id !== id)
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Portfolio Dashboard</h1>
        <p className="text-gray-600">
          Track holdings, portfolio value, and allocation.
        </p>

        {/* shows when stock prices are refreshing */}
        {isRefreshingPrices && (
          <p className="mt-2 text-sm text-gray-500">Refreshing stock prices...</p>
        )}

        {/* shows if price refresh fails */}
        {priceError && (
          <p className="mt-2 text-sm text-red-500">{priceError}</p>
        )}
      </div>

      <DashboardSummary holdings={holdings} />

      <AddHoldingForm onAddHolding={addHolding} />

      <HoldingsTable holdings={holdings} onDeleteHolding={deleteHolding} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioChart holdings={holdings} />
        <PortfolioHistoryChart holdings={holdings} />
      </div>
    </main>
  );
}