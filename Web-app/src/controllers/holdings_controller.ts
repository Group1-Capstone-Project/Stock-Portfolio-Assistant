//this controller is responsible for handling the business logic for the holdings API routes. It interacts with the holdings service to perform CRUD operations on holdings and returns appropriate responses based on the outcome of those operations. The controller also includes basic authentication checks using a user ID from the request headers, which can be replaced with a more robust authentication mechanism in the future.
import { NextRequest, NextResponse } from "next/server";
import { holdingservice } from "@/services/holdings_service";

export const holdingController = {

  // GET /api/holdings
  getAll: async (req: NextRequest) => {
    // replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id");
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const holdings = await holdingservice.findAll(userId);
    return NextResponse.json(holdings, { status: 200 });
  },

  // GET /api/holdings/:id
  getOne: async (req: NextRequest, id: string) => {
    // replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;

    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const holding = await holdingservice.findOne(id, userId);

    if (!holding) {
      return NextResponse.json(
        { error: "Holding not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(holding, { status: 200 });
  },

  // POST /api/holdings
  create: async (req: NextRequest) => {
    // replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id"); 

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const holding = await holdingservice.create(userId, body);
    return NextResponse.json(holding, { status: 201 });
  },

  // PUT /api/holdings/:id
  update: async (req: NextRequest, id: string) => {
    // replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const holding = await holdingservice.update(id, userId, body);
    return NextResponse.json(holding, { status: 200 });
  },

  // DELETE /api/holdings/:id
  delete: async (req: NextRequest, id: string) => {
    // replace with real auth when ready
    // const session = await auth();
    // const userId = session?.user?.id;
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await holdingservice.remove(id, userId);
    return NextResponse.json(
      { message: "Holding deleted" },
      { status: 200 }
    );
  },

};