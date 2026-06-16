"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import type { Holding } from "@/types/portfolio";

type AddHoldingFormProps = {
  onAddHolding: (holding: Holding) => void;
};

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function AddHoldingForm({ onAddHolding }: AddHoldingFormProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTicker] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(getTodayDate());

  function resetForm() {
    setTicker("");
    setShares("");
    setPurchasePrice("");
    setPurchaseDate(getTodayDate());
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!ticker || !shares || !purchasePrice || !purchaseDate) return;

    const newHolding: Holding = {
      id: crypto.randomUUID(),
      ticker: ticker.toUpperCase(),
      companyName: ticker.toUpperCase(),
      shares: Number(shares),
      price: Number(purchasePrice),
      purchasePrice: Number(purchasePrice),
      purchaseDate,
    };

    await fetch("/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": session?.user?.id ?? ""
      },
      body: JSON.stringify({
        ticker: ticker.toUpperCase(),
        shares: Number(shares),
        price: Number(purchasePrice),
        transactionType: "BUY",
        transactionDate: purchaseDate
      })
    });

    onAddHolding(newHolding);
    resetForm();
    setIsOpen(false);
  }

  return (
    <>
      <div className="flex justify-end">
        <button
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          Add Stock
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-lg border border-surface-border bg-surface-card p-6 text-foreground shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Add Holding</h2>

              <button
                className="text-xl text-foreground hover:text-danger"
                type="button"
                onClick={() => {
                  resetForm();
                  setIsOpen(false);
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <input
                className="rounded border border-surface-border bg-surface-tonal p-2 text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none"
                type="text"
                placeholder="Ticker"
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
              />

              <input
                className="rounded border border-surface-border bg-surface-tonal p-2 text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none"
                type="number"
                placeholder="Shares"
                value={shares}
                onChange={(event) => setShares(event.target.value)}
              />

              <input
                className="rounded border border-surface-border bg-surface-tonal p-2 text-foreground placeholder:text-gray-400 focus:border-primary focus:outline-none"
                type="number"
                placeholder="Purchase Price"
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
              />

              <input
                className="rounded border border-surface-border bg-surface-tonal p-2 text-foreground focus:border-primary focus:outline-none"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
              />

              <div className="flex justify-end gap-2">
                <button
                  className="rounded border border-surface-border px-4 py-2 text-foreground hover:bg-surface-tonal"
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsOpen(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover"
                  type="submit"
                >
                  Save Holding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}