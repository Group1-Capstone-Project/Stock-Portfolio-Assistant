import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { transactionservice } from "@/services/transactions_service";

export const transactionController = {

  // GET /api/transactions
  getAll: async (req: NextRequest) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

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
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const body = await req.json();
      const transaction = await transactionservice.createTransaction(userId, body);
      return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unable to create transaction";

      return NextResponse.json(
        { error: message },
        { status: 400 }
      );
    }
  },

  delete: async (req: NextRequest, id: string) => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await transactionservice.deleteTransaction(id, userId);
    return NextResponse.json({ message: "Transaction deleted" }, { status: 200 });
  }
};
