import { NextRequest } from "next/server";
import { fetchQuote, FinnhubApiError, StockQuote } from "@/lib/finnhub";

const MAX_SYMBOLS = 20;

type BatchQuoteItem = StockQuote | { symbol: string; notFound: true };

export async function GET(request: NextRequest) {
  // check session once auth is configured

  const raw = request.nextUrl.searchParams.get("symbols")?.trim();

  if (!raw) {
    return Response.json({ error: "At least one symbol is required." }, { status: 400 });
  }

  const symbols = [...new Set(raw.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean))];

  if (symbols.length === 0) {
    return Response.json({ error: "At least one symbol is required." }, { status: 400 });
  }

  if (symbols.length > MAX_SYMBOLS) {
    return Response.json(
      { error: `Maximum ${MAX_SYMBOLS} symbols per batch request.` },
      { status: 400 }
    );
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol): Promise<BatchQuoteItem> => {
        const quote = await fetchQuote(symbol);
        return quote ?? { symbol, notFound: true };
      })
    );

    return Response.json({ quotes: results });
  } catch (err) {
    if (err instanceof FinnhubApiError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    return Response.json(
      { error: "A server error occurred while retrieving quotes." },
      { status: 500 }
    );
  }
}
