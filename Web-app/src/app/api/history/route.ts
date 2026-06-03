import { NextRequest } from "next/server";
import { fetchCandles, FinnhubApiError } from "@/lib/finnhub";

type Period = "1D" | "1W" | "1M" | "3M" | "1Y";

const PERIOD_CONFIG: Record<Period, { resolution: string; lookbackDays: number }> = {
  "1D": { resolution: "5",  lookbackDays: 1   },
  "1W": { resolution: "15", lookbackDays: 7   },
  "1M": { resolution: "60", lookbackDays: 30  },
  "3M": { resolution: "D",  lookbackDays: 90  },
  "1Y": { resolution: "W",  lookbackDays: 365 },
};

const VALID_PERIODS = Object.keys(PERIOD_CONFIG).join(", ");

export async function GET(request: NextRequest) {
  // check session once auth is configured

  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();
  const period = request.nextUrl.searchParams.get("period")?.trim().toUpperCase() as Period | null;

  if (!symbol) {
    return Response.json({ error: "A stock symbol is required." }, { status: 400 });
  }

  if (!period || !(period in PERIOD_CONFIG)) {
    return Response.json(
      { error: `Period must be one of: ${VALID_PERIODS}.` },
      { status: 400 }
    );
  }

  const { resolution, lookbackDays } = PERIOD_CONFIG[period];
  const to = Math.floor(Date.now() / 1000);
  const from = to - lookbackDays * 86400;

  try {
    const candles = await fetchCandles(symbol, resolution, from, to);

    if (!candles) {
      return Response.json(
        { error: "No historical data found for that symbol and period." },
        { status: 404 }
      );
    }

    return Response.json({ symbol, period, resolution, candles });
  } catch (err) {
    if (err instanceof FinnhubApiError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    return Response.json(
      { error: "A server error occurred while retrieving historical data." },
      { status: 500 }
    );
  }
}
