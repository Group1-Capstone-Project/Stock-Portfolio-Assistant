import { NextRequest } from "next/server";
import { portfolioController } from "@/controllers/portfolio_controller";

export async function GET(req: NextRequest) {
  return portfolioController.getPortfolio(req);
}