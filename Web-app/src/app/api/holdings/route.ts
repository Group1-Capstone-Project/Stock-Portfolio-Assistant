//this route is for handling requests to /api/holdings, which is the endpoint for managing the user's stock holdings. It supports GET and POST methods for retrieving all holdings and creating a new holding respectively.
import { NextRequest } from "next/server";
import { holdingController } from "@/controllers/holdings_controller";

export async function GET(req: NextRequest) {
  return holdingController.getAll(req);
}