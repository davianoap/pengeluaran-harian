import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import DashboardClient from "./dashboard-client";

// Mendapatkan tanggal lokal WIB (Asia/Jakarta)
function getLocalDateWIB(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  const DEFAULT_USER_ID = "default_user";

  // Fetch today's summary and recent transactions
  const today = getLocalDateWIB();
  const userTransactions = await db.query.transactions.findMany({
    where: and(
      eq(transactions.userId, DEFAULT_USER_ID),
      eq(transactions.date, today)
    ),
    orderBy: [desc(transactions.createdAt)],
  });

  const todayTotal = userTransactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <DashboardClient 
      transactions={userTransactions} 
      todayTotal={todayTotal} 
    />
  );
}
