import { NextRequest } from "next/server";
import { fetchSearch, FinnhubApiError } from "@/lib/finnhub";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return Response.json({ error: "A search query is required." }, { status: 400 });
  }

  try {
    const results = await fetchSearch(q);
    return Response.json({ results });
  } catch (err) {
    if (err instanceof FinnhubApiError) {
      return Response.json({ error: err.message }, { status: err.statusCode });
    }
    return Response.json(
      { error: "A server error occurred while searching." },
      { status: 500 }
    );
  }
}
