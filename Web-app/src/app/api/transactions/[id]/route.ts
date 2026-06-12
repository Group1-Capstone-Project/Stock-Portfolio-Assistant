import { NextRequest } from "next/server";
import { transactionController } from "@/controllers/transactions_controller";

// Next.js 16 treats dynamic route params as a Promise
// awaiting params here prevents the production build type check from failing
type TransactionRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

// GET /api/transactions/:id
// retrieves one transaction by ID
export async function GET(req: NextRequest, { params }: TransactionRouteContext) {
  const { id } = await params;

  return transactionController.getOne(req, id);
}

// DELETE /api/transactions/:id
// deletes one transaction by ID
export async function DELETE(req: NextRequest, { params }: TransactionRouteContext) {
  const { id } = await params;

  return transactionController.delete(req, id);
}