import { NextRequest, NextResponse } from "next/server";
import { transactionservice } from "@/services/transactions_service";

export const transactionController = {

  // GET /api/transactions
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
    const transactions = await transactionservice.findAllTransactions(userId);
    return NextResponse.json(transactions, { status: 200 });
  },

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
    const transaction = await transactionservice.findOneTransaction(id, userId);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(transaction, { status: 200 });
  },

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
    const transaction = await transactionservice.createTransaction(userId, body);
    return NextResponse.json(transaction, { status: 201 });
  },

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
    await transactionservice.deleteTransaction(id, userId);
    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  }
}