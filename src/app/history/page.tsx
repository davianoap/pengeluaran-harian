import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import HistoryClient from "./history-client";

export default async function HistoryPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch all transactions for the user
  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, session.user.id),
    orderBy: [desc(transactions.date), desc(transactions.createdAt)],
  });

  return <HistoryClient user={session.user} initialTransactions={userTransactions} />;
}
