import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { holdingService } from "@/services/holdings_service";

export const holdingController = {

  // GET /api/holdings
  getAll: async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const holdings = await holdingService.findAll(userId);
    return NextResponse.json(holdings, { status: 200 });
  },

  // GET /api/holdings/:id
  getOne: async (req: NextRequest, id: string) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const holding = await holdingService.findOne(id, userId);

    if (!holding) {
      return NextResponse.json(
        { error: "Holding not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(holding, { status: 200 });
  },

  // PUT /api/holdings/:id
  update: async (req: NextRequest, id: string) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // only allow updating latestPrice, nothing else
    if (!body.latestPrice) {
      return NextResponse.json(
        { error: "Only latestPrice can be updated" },
        { status: 400 }
      );
    }

    const holding = await holdingService.updateLatestPrice(id, userId, body.latestPrice);
    return NextResponse.json(holding, { status: 200 });
  }
};
