import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user_service";

export const userController = {
  getUser: async (req: NextRequest, id: string) => {
    const user = await userService.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  },

  createUser: async (req: NextRequest) => {
    const body = await req.json();

    const existing = await userService.findByEmail(body.email);
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    const user = await userService.create(body);
    return NextResponse.json(user, { status: 201 });
  },

  updateUser: async (req: NextRequest, id: string) => {
    const body = await req.json();

    const user = await userService.update(id, body);
    return NextResponse.json(user, { status: 200 });
  },

  deleteUser: async (req: NextRequest, id: string) => {
    await userService.remove(id);
    return NextResponse.json({ message: "User deleted" }, { status: 200 });
  },
};