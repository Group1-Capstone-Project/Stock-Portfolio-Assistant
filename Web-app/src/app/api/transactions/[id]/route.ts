import { NextRequest } from "next/server";
import { transactionController } from "@/controllers/transactions_controller";

// GET one transaction
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return transactionController.getOne(req, params.id);
}

// DELETE one transaction
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return transactionController.delete(req, params.id);
}