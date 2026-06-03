"use client";

import { useState } from "react";
import type { Holding } from "@/types/portfolio";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import HoldingsTable from "@/components/Dashboard/HoldingsTable";
import AddHoldingForm from "@/components/Dashboard/AddHoldingForm";
import PortfolioChart from "@/components/Dashboard/PortfolioChart";
import PortfolioHistoryChart from "@/components/Dashboard/PortfolioHistoryChart";
import { holdings as mockHoldings } from "@/data/mockPortfolio";// change to real portfolio when backend is ready

export default function DashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>(mockHoldings);

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