// this file keeps frontend stock API calls in one place
// it calls our own Next.js backend routes instead of calling Finnhub directly,
// which keeps the Finnhub API key protected on the server side

export type StockQuote = {
  symbol: string;
  currentPrice: number;
  change: number;
  percentChange: number;
  dayHigh: number;
  dayLow: number;
  openPrice: number;
  previousClose: number;
  timestamp: number;
};

export type BatchQuoteItem = StockQuote | { symbol: string; notFound: true };

export async function getBatchQuotes(symbols: string[]): Promise<BatchQuoteItem[]> {
  const uniqueSymbols = [...new Set(symbols.map((symbol) => symbol.trim().toUpperCase()))]
    .filter(Boolean);

  if (uniqueSymbols.length === 0) {
    return [];
  }

  const response = await fetch(
    `/api/quote/batch?symbols=${encodeURIComponent(uniqueSymbols.join(","))}`
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve stock quotes.");
  }

  const data: { quotes: BatchQuoteItem[] } = await response.json();
  return data.quotes;
}

export function isValidQuote(quote: BatchQuoteItem): quote is StockQuote {
  return !("notFound" in quote);
}