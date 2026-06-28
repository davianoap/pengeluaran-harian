import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import HistoryClient from "./history-client";

export default async function HistoryPage() {
  const DEFAULT_USER_ID = "default_user";

  // Fetch all transactions for the user
  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, DEFAULT_USER_ID),
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  });

  return <HistoryClient initialTransactions={userTransactions} />;
}
