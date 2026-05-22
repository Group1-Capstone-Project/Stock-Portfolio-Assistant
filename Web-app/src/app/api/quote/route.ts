import { NextRequest, NextResponse } from "next/server";

type FinnhubQuote = {
  c: number;  // current price
  d: number;  // change
  dp: number; // percent change
  h: number;  // high price of the day
  l: number;  // low price of the day
  o: number;  // open price of the day
  pc: number; // previous close price
  t: number;  // timestamp
};

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get("symbol")?.toUpperCase();
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!symbol) {
    return NextResponse.json(
      { error: "A stock symbol is required." },
      { status: 400 }
    );
  }

  if (!apiKey) {
    return NextResponse.json(
      { error: "Finnhub API key is not configured." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}`,
      {
        headers: {
          "X-Finnhub-Token": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve stock quote." },
        { status: response.status }
      );
    }

    const quote: FinnhubQuote = await response.json();

    if (!quote.c || quote.c === 0) {
      return NextResponse.json(
        { error: "No quote data was found for that stock symbol." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol,
      currentPrice: quote.c,
      change: quote.d,
      percentChange: quote.dp,
      dayHigh: quote.h,
      dayLow: quote.l,
      openPrice: quote.o,
      previousClose: quote.pc,
      timestamp: quote.t,
    });
  } catch {
    return NextResponse.json(
      { error: "A server error occurred while retrieving stock data." },
      { status: 500 }
    );
  }
}