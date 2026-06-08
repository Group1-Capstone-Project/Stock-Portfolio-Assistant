import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { userService } from "@/services/user_service";

export const userController = {

  getUser: async (req: NextRequest, user_id: string) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // user can only get their own data
    if (userId !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await userService.findById(user_id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  },

  updateUser: async (req: NextRequest, user_id: string) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // user can only update their own data
    if (userId !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const user = await userService.update(user_id, body);
    return NextResponse.json(user, { status: 200 });
  }
};
