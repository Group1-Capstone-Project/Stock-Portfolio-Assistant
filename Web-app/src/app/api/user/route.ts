import { userController } from "@/controllers/user_controller";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.getUser(req, params.id);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.updateUser(req, params.id);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return userController.deleteUser(req, params.id);
}

export async function POST(req: NextRequest) {
  return userController.createUser(req);
}