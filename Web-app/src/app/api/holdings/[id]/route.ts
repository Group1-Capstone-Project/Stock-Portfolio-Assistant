// handles requests for a specific holding ID
// Next.js 16 treats route params as a Promise, so params must be awaited before reading id

import { NextRequest } from "next/server";
import { holdingController } from "@/controllers/holdings_controller";

type HoldingRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/holdings/:id
// retrieves one holding by ID
export async function GET(req: NextRequest, { params }: HoldingRouteContext) {
  const { id } = await params;

  return holdingController.getOne(req, id);
}

// PUT /api/holdings/:id
// updates one holding by ID
export async function PUT(req: NextRequest, { params }: HoldingRouteContext) {
  const { id } = await params;

  return holdingController.update(req, id);
}