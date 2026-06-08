// this is the user controller that will be used to handle the user logic except for the database interactions, which are handled by the user service but still should pass through the controller for any additional logic or validation before reaching the service
import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user_service";

export const userController = {

  getUser: async (req: NextRequest, user_id: string) => {
    // TODO: replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id");

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
    const userId = req.headers.get("x-user-id");

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