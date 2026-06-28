import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import DashboardClient from "./dashboard-client";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    redirect("/login");
  }

  // Fetch today's summary and recent transactions
  const userTransactions = await db.query.transactions.findMany({
    where: eq(transactions.userId, session.user.id),
    orderBy: [desc(transactions.createdAt)],
    limit: 10
  });

  const today = new Date().toISOString().split('T')[0];
  const todayTotal = userTransactions
    .filter(t => t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardClient 
      user={session.user} 
      transactions={userTransactions} 
      todayTotal={todayTotal} 
    />
  );
}
