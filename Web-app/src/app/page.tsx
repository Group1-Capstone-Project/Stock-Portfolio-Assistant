"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import type { Holding } from "@/types/portfolio";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import HoldingsTable from "@/components/Dashboard/HoldingsTable";
import AddHoldingForm from "@/components/Dashboard/AddHoldingForm";

import dynamic from "next/dynamic";

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

type PortfolioApiHolding = {
  id: string;
  ticker: string;
  shares: number;
  averageBuyPrice: number;
  latestPrice: number;
  createdAt: string;
};

type PortfolioApiResponse = {
  holdings: PortfolioApiHolding[];
};

function mapPortfolioHolding(holding: PortfolioApiHolding): Holding {
  // the dashboard UI still expects the frontend Holding shape, so normalize
  // the persisted API payload here instead of spreading conversion logic around
  const fallbackDate = new Date().toISOString().split("T")[0];

  return {
    id: holding.id,
    ticker: holding.ticker,
    companyName: holding.ticker,
    shares: Number(holding.shares),
    price: Number(holding.latestPrice || holding.averageBuyPrice),
    purchasePrice: Number(holding.averageBuyPrice),
    purchaseDate: holding.createdAt
      ? new Date(holding.createdAt).toISOString().split("T")[0]
      : fallbackDate,
  };
}

export default function DashboardPage() {
  const { status } = useSession();
  const [holdings, setHoldings] = useState<Holding[]>([]);

  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [isSavingHolding, setIsSavingHolding] = useState(false);

  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  async function loadPortfolio() {
    try {
      setIsLoadingPortfolio(true);
      setPortfolioError(null);

      const response = await fetch("/api/portfolio", { cache: "no-store" });

      if (!response.ok) {
        setPortfolioError("Unable to load your saved holdings right now.");
        return;
      }

      const data = (await response.json()) as PortfolioApiResponse;
      const mapped = (data.holdings ?? []).map(mapPortfolioHolding);
      setHoldings(mapped);
    } catch {
      setPortfolioError("Unable to load your saved holdings right now.");
    } finally {
      setIsLoadingPortfolio(false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }
    loadPortfolio();
  }, [status]);

  async function addHolding(newHolding: Holding) {
    try {
      setIsSavingHolding(true);
      setPortfolioError(null);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: newHolding.ticker,
          shares: newHolding.shares,
          price: newHolding.purchasePrice,
          transactionType: "BUY",
          transactionDate: `${newHolding.purchaseDate}T00:00:00.000Z`,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setPortfolioError(
          errorPayload?.error || "Unable to save this holding right now."
        );
        return;
      }

      await loadPortfolio();
    } catch {
      setPortfolioError("Unable to save this holding right now.");
    } finally {
      setIsSavingHolding(false);
    }
  }

  async function deleteHolding(id: string) {
    const holding = holdings.find((current) => current.id === id);

    if (!holding) {
      return;
    }

    try {
      setIsSavingHolding(true);
      setPortfolioError(null);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticker: holding.ticker,
          shares: holding.shares,
          price: holding.price,
          transactionType: "SELL",
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        setPortfolioError(
          errorPayload?.error || "Unable to delete this holding right now."
        );
        return;
      }

      await loadPortfolio();
    } catch {
      setPortfolioError("Unable to delete this holding right now.");
    } finally {
      setIsSavingHolding(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <p className="text-sm text-gray-500">Checking session...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center p-6">
        <section className="w-full rounded-xl border bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900">Stock Portfolio Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Sign in to access your saved portfolio, holdings, and history.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Portfolio Dashboard</h1>
        <p className="text-gray-600">
          Track holdings, portfolio value, and allocation.
        </p>

        {isLoadingPortfolio && (
          <p className="mt-2 text-sm text-gray-500">Loading saved holdings...</p>
        )}

        {isSavingHolding && (
          <p className="mt-2 text-sm text-gray-500">Saving changes...</p>
        )}

        {portfolioError && (
          <p className="mt-2 text-sm text-red-500">{portfolioError}</p>
        )}
      </div>

      <DashboardSummary holdings={holdings} />

      <AddHoldingForm onAddHolding={addHolding} />

      <HoldingsTable holdings={holdings} onDeleteHolding={deleteHolding} />

      <div className="grid gap-6 lg:grid-cols-2">
        <PortfolioChart holdings={holdings} />
        <PortfolioHistoryChart holdings={holdings} />
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Log out
        </button>
      </div>
    </main>
  );
}