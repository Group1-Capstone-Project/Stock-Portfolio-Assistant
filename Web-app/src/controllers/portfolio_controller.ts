import { NextRequest, NextResponse } from "next/server";
import { portfolioService } from "@/services/portfolio_service";

export const portfolioController = {
  getPortfolio: async (req: NextRequest) => {
    // TODO: replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const portfolio = await portfolioService.getPortfolio(userId);
    return NextResponse.json(portfolio, { status: 200 });
  }
};