import { NextRequest } from "next/server";
import { fetchQuote, FinnhubApiError } from "@/lib/finnhub";

export async function GET(request: NextRequest) {
  // check session once auth is configured

  const symbol = request.nextUrl.searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return Response.json({ error: "A stock symbol is required." }, { status: 400 });
  }

  try {
    const quote = await fetchQuote(symbol);

    if (!quote) {
      return Response.json(
        { error: "No quote data was found for that stock symbol." },
        { status: 404 }
      );
    }

    return Response.json(quote);
  } catch (err) {
    if (err instanceof FinnhubApiError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    return Response.json(
      { error: "A server error occurred while retrieving stock data." },
      { status: 500 }
    );
  }
}
