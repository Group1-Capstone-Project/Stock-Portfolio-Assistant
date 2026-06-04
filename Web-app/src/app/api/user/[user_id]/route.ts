// handles requests for a specific user ID
// Next.js only provides params.user_id when the route is inside a dynamic folder like [user_id]

import { userController } from "@/controllers/user_controller";
import { NextRequest } from "next/server";

// GET /api/user/:user_id
// retrieves one user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  return userController.getUser(req, params.user_id);
}

// PUT /api/user/:user_id
// updates one user by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { user_id: string } }
) {
  return userController.updateUser(req, params.user_id);
}