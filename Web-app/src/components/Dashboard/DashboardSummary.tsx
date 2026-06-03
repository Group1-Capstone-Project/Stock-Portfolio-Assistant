import type { Holding } from "@/types/portfolio";

type DashboardSummaryProps = {
  holdings: Holding[];
};

export default function DashboardSummary({ holdings }: DashboardSummaryProps) {
  const totalValue = holdings.reduce(
    (total, holding) => total + holding.shares * holding.price,
    0
  );

  const totalCost = holdings.reduce(
    (total, holding) => total + holding.shares * holding.purchasePrice,
    0
  );

  const gainLoss = totalValue - totalCost;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border p-4 shadow-sm">
        <h2 className="text-sm text-gray-500">Portfolio Value</h2>
        <p className="text-2xl font-semibold">${totalValue.toFixed(2)}</p>
      </div>

      <div className="rounded-lg border p-4 shadow-sm">
        <h2 className="text-sm text-gray-500">Total Holdings</h2>
        <p className="text-2xl font-semibold">{holdings.length}</p>
      </div>

      <div className="rounded-lg border p-4 shadow-sm">
        <h2 className="text-sm text-gray-500">Gain / Loss</h2>
        <p className="text-2xl font-semibold">${gainLoss.toFixed(2)}</p>
      </div>
    </div>
  );
}