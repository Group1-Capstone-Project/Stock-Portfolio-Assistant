// handles requests for a specific user ID
// Next.js 16 treats route params as a Promise, so params must be awaited before reading user_id

import { userController } from "@/controllers/user_controller";
import { NextRequest } from "next/server";

type UserRouteContext = {
  params: Promise<{
    user_id: string;
  }>;
};

// GET /api/user/:user_id
// retrieves one user by ID
export async function GET(req: NextRequest, { params }: UserRouteContext) {
  const { user_id } = await params;

  return userController.getUser(req, user_id);
}

// PUT /api/user/:user_id
// updates one user by ID
export async function PUT(req: NextRequest, { params }: UserRouteContext) {
  const { user_id } = await params;

  return userController.updateUser(req, user_id);
}