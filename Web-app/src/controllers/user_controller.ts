// this is the user controller that will be used to handle the user logic except for the database interactions, which are handled by the user service but still should pass through the controller for any additional logic or validation before reaching the service
import { NextRequest, NextResponse } from "next/server";
import { userService } from "@/services/user_service";

export const userController = {
  getUser: async (req: NextRequest, user_id: string) => {
    const user = await userService.findById(user_id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  },

  updateUser: async (req: NextRequest, user_id: string) => {
    const body = await req.json();

    const user = await userService.update(user_id, body);
    return NextResponse.json(user, { status: 200 });
  }
};