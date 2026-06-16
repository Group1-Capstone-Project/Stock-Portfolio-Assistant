"use client";

import { useEffect, useState } from "react";
import type { Holding } from "@/types/portfolio";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import HoldingsTable from "@/components/Dashboard/HoldingsTable";
import AddHoldingForm from "@/components/Dashboard/AddHoldingForm";
// this helper calls our own backend route at /api/quote/batch
// the frontend does not call Finnhub directly
import { getBatchQuotes, isValidQuote } from "@/lib/stockApi";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// recharts should only render in the browser because it needs real container dimensions
// this keeps the chart components unchanged but prevents chart sizing
// warnings during build/prerender
const PortfolioChart = dynamic(
  () => import("@/components/Dashboard/PortfolioChart"),
  { ssr: false }
);

const PortfolioHistoryChart = dynamic(
  () => import("@/components/Dashboard/PortfolioHistoryChart"),
  { ssr: false }
);

export default function DashboardPage() {
  // tracks whether the dashboard is currently refreshing stock prices
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  // stores an error message if quote retrieval fails
  const [priceError, setPriceError] = useState<string | null>(null);
  const { data: session } = useSession();
  // when the dashboard first loads, this requests updated prices for the
  // current mock holdings and replaces the temporary hardcoded price values
  useEffect(() => {
    async function fetchPortfolio() {
      if (!session?.user?.id) return;
      const response = await fetch("/api/portfolio", {
        headers: { "x-user-id": session.user.id }
      });
      const data = await response.json();
      setHoldings(data.holdings);
    }
    fetchPortfolio();
  }, [session]);

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