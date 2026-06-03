"use client";

import type { Holding } from "@/types/portfolio";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type PortfolioHistoryChartProps = {
  holdings: Holding[];
};

export default function PortfolioHistoryChart({
  holdings,
}: PortfolioHistoryChartProps) {
  const currentValue = holdings.reduce(
    (total, holding) => total + holding.shares * holding.price,
    0
  );
//hard coded historical data for demo purposes
  const chartData = [
    { date: "Day 1", value: currentValue * 0.94 },
    { date: "Day 5", value: currentValue * 0.96 },
    { date: "Day 10", value: currentValue * 0.95 },
    { date: "Day 15", value: currentValue * 0.98 },
    { date: "Day 20", value: currentValue * 1.01 },
    { date: "Day 25", value: currentValue * 0.99 },
    { date: "Day 30", value: currentValue },
  ];

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">30-Day Portfolio History</h2>

      <div className="h-72 min-h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}