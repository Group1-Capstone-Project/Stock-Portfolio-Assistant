const FINNHUB_BASE = "https://finnhub.io/api/v1";

// --- Finnhub raw response shapes (internal only) ---

type FinnhubQuote = {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // day high
  l: number;  // day low
  o: number;  // open price
  pc: number; // previous close
  t: number;  // unix timestamp
};

type FinnhubSearchResult = {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
};

type FinnhubSearchResponse = {
  count: number;
  result: FinnhubSearchResult[];
};

type FinnhubCandle = {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: string; // "ok" or "no_data"
  t: number[];
  v: number[];
};

// --- Exported normalized types ---

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

export type StockSearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
  type: string;
};

export type CandleData = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// --- Error class ---

export class FinnhubApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "FinnhubApiError";
  }
}

// --- Internal helpers ---

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new FinnhubApiError("Finnhub API key is not configured.", 500);
  return key;
}

async function finnhubFetch(path: string): Promise<Response> {
  const key = getApiKey();
  const res = await fetch(`${FINNHUB_BASE}${path}`, {
    headers: { "X-Finnhub-Token": key },
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 429) {
      throw new FinnhubApiError("Finnhub rate limit reached. Try again shortly.", 429);
    }
    throw new FinnhubApiError(
      `Finnhub returned an error (status ${res.status}).`,
      502
    );
  }

  return res;
}

// --- Exported fetch functions ---

export async function fetchQuote(symbol: string): Promise<StockQuote | null> {
  const res = await finnhubFetch(`/quote?symbol=${encodeURIComponent(symbol)}`);
  const data: FinnhubQuote = await res.json();

  if (!data.c || data.c === 0) return null;

  return {
    symbol,
    currentPrice: data.c,
    change: data.d,
    percentChange: data.dp,
    dayHigh: data.h,
    dayLow: data.l,
    openPrice: data.o,
    previousClose: data.pc,
    timestamp: data.t,
  };
}

export async function fetchSearch(query: string): Promise<StockSearchResult[]> {
  const res = await finnhubFetch(`/search?q=${encodeURIComponent(query)}`);
  const data: FinnhubSearchResponse = await res.json();

  return (data.result ?? []).map((r) => ({
    symbol: r.symbol,
    displaySymbol: r.displaySymbol,
    description: r.description,
    type: r.type,
  }));
}

export async function fetchCandles(
  symbol: string,
  resolution: string,
  from: number,
  to: number
): Promise<CandleData[] | null> {
  const path =
    `/stock/candle?symbol=${encodeURIComponent(symbol)}` +
    `&resolution=${encodeURIComponent(resolution)}` +
    `&from=${from}&to=${to}`;

  const res = await finnhubFetch(path);
  const data: FinnhubCandle = await res.json();

  if (data.s !== "ok") return null;

  return data.t.map((ts, i) => ({
    timestamp: ts,
    open: data.o[i],
    high: data.h[i],
    low: data.l[i],
    close: data.c[i],
    volume: data.v[i],
  }));
}
