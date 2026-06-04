"use client";

import type { Holding } from "@/types/portfolio";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PortfolioChartProps = {
  holdings: Holding[];
};

export default function PortfolioChart({ holdings }: PortfolioChartProps) {
  const chartData = Object.values(
    holdings.reduce<Record<string, { name: string; value: number }>>(
      (groups, holding) => {
        if (!groups[holding.ticker]) {
          groups[holding.ticker] = {
            name: holding.ticker,
            value: 0,
          };
        }

        groups[holding.ticker].value += holding.shares * holding.price;

        return groups;
      },
      {}
    )
  );

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Portfolio Allocation</h2>

      <div className="h-72 min-h-72">
        {/* minWidth and minHeight prevent Recharts from calculating a negative
            container size during the production build/prerender step */}
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              label={(entry) => entry.name}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}