//this route is for handling requests to /api/holdings/:id, where :id is the id of a specific holding. It supports GET, PUT, and DELETE methods for retrieving, updating, and deleting a holding respectively.
import { NextRequest } from "next/server";
import { holdingController } from "@/controllers/holdings_controller";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return holdingController.getOne(req, params.id);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return holdingController.update(req, params.id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return holdingController.delete(req, params.id);
}