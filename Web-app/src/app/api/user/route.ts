import { userController } from "@/controllers/user_controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { user_id: string } }) {
  return userController.getUser(req, params.user_id);
}

export async function PUT(req: NextRequest, { params }: { params: { user_id: string } }) {
  return userController.updateUser(req, params.user_id);
}