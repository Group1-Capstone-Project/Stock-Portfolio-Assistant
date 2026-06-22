import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { portfolioService } from "@/services/portfolio_service";

export const portfolioController = {
  getPortfolio: async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const portfolio = await portfolioService.getPortfolio(userId);
    console.log("Portfolio response:", JSON.stringify(portfolio.holdings[0]));
    return NextResponse.json(portfolio, { status: 200 });
  }
};
