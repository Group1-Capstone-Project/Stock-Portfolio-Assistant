"use client";

import { Fragment, useState } from "react";
import type { Holding } from "@/types/portfolio";

type HoldingsTableProps = {
  holdings: Holding[];
  onDeleteHolding: (id: string) => void;
};

export default function HoldingsTable({
  holdings,
  onDeleteHolding,
}: HoldingsTableProps) {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const groupedHoldings = holdings.reduce<Record<string, Holding[]>>(
    (groups, holding) => {
      if (!groups[holding.ticker]) {
        groups[holding.ticker] = [];
      }

      groups[holding.ticker].push(holding);
      return groups;
    },
    {}
  );

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Holdings</h2>

      <div className="overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2">Ticker</th>
              <th className="px-4 py-2">Shares</th>
              <th className="px-4 py-2">Avg Cost</th>
              <th className="px-4 py-2">Current Price</th>
              <th className="px-4 py-2">Value</th>
              <th className="px-4 py-2">Gain/Loss</th>
              <th className="px-4 py-2">Return</th>
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {Object.entries(groupedHoldings).map(([ticker, lots]) => {
              const totalShares = lots.reduce(
                (total, lot) => total + lot.shares,
                0
              );

              const totalCost = lots.reduce(
                (total, lot) => total + lot.shares * lot.purchasePrice,
                0
              );

              const currentValue = lots.reduce(
                (total, lot) => total + lot.shares * lot.price,
                0
              );

              const currentPrice = lots[0].price;
              const averageCost = totalCost / totalShares;
              const gainLoss = currentValue - totalCost;
              const returnPercent = (gainLoss / totalCost) * 100;
              const isSelected = selectedTicker === ticker;

              return (
                <Fragment key={ticker}>
                  <tr className="border-b">
                    <td className="px-4 py-2">
                      <button
                        className="font-semibold underline"
                        onClick={() =>
                          setSelectedTicker(isSelected ? null : ticker)
                        }
                      >
                        {ticker}
                      </button>
                    </td>
                    <td className="px-4 py-2">{totalShares}</td>
                    <td className="px-4 py-2">${averageCost.toFixed(2)}</td>
                    <td className="px-4 py-2">${currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-2">${currentValue.toFixed(2)}</td>
                    <td className="px-4 py-2">${gainLoss.toFixed(2)}</td>
                    <td className="px-4 py-2">
                      {returnPercent.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2"></td>
                  </tr>

                  {isSelected &&
                    lots.map((lot) => {
                      const lotValue = lot.shares * lot.price;
                      const lotCost = lot.shares * lot.purchasePrice;
                      const lotGainLoss = lotValue - lotCost;
                      const lotReturnPercent = (lotGainLoss / lotCost) * 100;

                      return (
                        <tr key={lot.id} className="border-b bg-gray-50">
                          <td className="px-4 py-2 pl-8">
                            Lot from {lot.purchaseDate}
                          </td>
                          <td className="px-4 py-2">{lot.shares}</td>
                          <td className="px-4 py-2">
                            ${lot.purchasePrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            ${lot.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            ${lotValue.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            ${lotGainLoss.toFixed(2)}
                          </td>
                          <td className="px-4 py-2">
                            {lotReturnPercent.toFixed(2)}%
                          </td>
                          <td className="px-4 py-2">
                            <button
                              className="rounded bg-red-600 px-3 py-1 text-white"
                              onClick={() => onDeleteHolding(lot.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}