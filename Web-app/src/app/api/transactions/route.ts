// temporary transactions route placeholder
// keeps the API route valid until transaction logic is implemented
// it prevents an empty route.ts file from causing runtime issues
import { NextRequest, NextResponse } from "next/server";
import { transactionController } from "@/controllers/transactions_controller";

export async function GET(req: NextRequest) {
  return transactionController.getAll(req);
}

export async function POST(req: NextRequest) {
  return transactionController.create(req);
}