"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import dynamic from "next/dynamic";

import type { Holding } from "@/types/portfolio";
import DashboardSummary from "@/components/Dashboard/DashboardSummary";
import HoldingsTable from "@/components/Dashboard/HoldingsTable";
import AddHoldingForm from "@/components/Dashboard/AddHoldingForm";

const PortfolioAllocationChart = dynamic(
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

type PortfolioLoadStatus = "idle" | "loaded" | "error";

function mapPortfolioHolding(holding: PortfolioApiHolding): Holding {
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
  const [portfolioLoadStatus, setPortfolioLoadStatus] =
    useState<PortfolioLoadStatus>("idle");
  const [isSavingHolding, setIsSavingHolding] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  // this keeps the original purpose of the loading message without calling
  // setState synchronously inside useEffect
  // the page is loading while the user is authenticated 
  // and the first portfolio request has not completed yet
  const isLoadingPortfolio =
    status === "authenticated" && portfolioLoadStatus === "idle";

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    let ignore = false;

    async function loadInitialPortfolio() {
      try {
        const response = await fetch("/api/portfolio", { cache: "no-store" });

        // reacts recommended fetch pattern is to ignore stale async responses
        // during cleanup so an old request cannot update state after navigation
        // or after the effect reruns
        if (ignore) return;

        if (!response.ok) {
          setPortfolioError("Unable to load your saved holdings right now.");
          setPortfolioLoadStatus("error");
          return;
        }

        const data = (await response.json()) as PortfolioApiResponse;
        const mapped = (data.holdings ?? []).map(mapPortfolioHolding);

        if (ignore) return;

        setHoldings(mapped);
        setPortfolioError(null);
        setPortfolioLoadStatus("loaded");
      } catch {
        if (ignore) return;

        setPortfolioError("Unable to load your saved holdings right now.");
        setPortfolioLoadStatus("error");
      }
    }

    void loadInitialPortfolio();

    return () => {
      ignore = true;
    };
  }, [status]);

  async function loadPortfolio() {
    try {
      const response = await fetch("/api/portfolio", { cache: "no-store" });

      if (!response.ok) {
        setPortfolioError("Unable to load your saved holdings right now.");
        setPortfolioLoadStatus("error");
        return;
      }

      const data = (await response.json()) as PortfolioApiResponse;
      const mapped = (data.holdings ?? []).map(mapPortfolioHolding);

      setHoldings(mapped);
      setPortfolioError(null);
      setPortfolioLoadStatus("loaded");
    } catch {
      setPortfolioError("Unable to load your saved holdings right now.");
      setPortfolioLoadStatus("error");
    }
  }

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
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-600">Checking session...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <section className="max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Portfolio Dashboard
          </h1>
          <p className="mt-3 text-gray-600">
            Sign in to access your saved portfolio, holdings, and history.
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/login"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Create account
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Stock Portfolio Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track holdings, portfolio value, and allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>

      {isLoadingPortfolio && (
        <p className="mb-4 text-sm text-blue-600">Loading saved holdings...</p>
      )}

      {isSavingHolding && (
        <p className="mb-4 text-sm text-blue-600">Saving changes...</p>
      )}

      {portfolioError && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {portfolioError}
        </p>
      )}

      <div className="grid gap-6">
        <DashboardSummary holdings={holdings} />

        <AddHoldingForm onAddHolding={addHolding} />

        <div className="grid gap-6 lg:grid-cols-2">
          <PortfolioAllocationChart holdings={holdings} />
          <PortfolioHistoryChart holdings={holdings} />
        </div>

        <HoldingsTable holdings={holdings} onDeleteHolding={deleteHolding} />
      </div>
    </main>
  );
}