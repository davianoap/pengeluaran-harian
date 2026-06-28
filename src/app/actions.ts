"use server";

import { db } from "@/db";
import { transactions } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

// Fungsi sederhana untuk deteksi kategori dari uraian
function detectCategory(description: string): string {
  const desc = description.toLowerCase();
  if (desc.match(/makan|minum|nasi|kopi|roti|warteg|gofood|grabfood/)) return "Makanan";
  if (desc.match(/gojek|grab|bensin|tol|parkir|kereta|krl|mrt|bus/)) return "Transport";
  if (desc.match(/belanja|indomaret|alfamart|supermarket|shopee|tokopedia/)) return "Belanja";
  if (desc.match(/nonton|bioskop|netflix|spotify|game/)) return "Hiburan";
  if (desc.match(/listrik|air|internet|wifi|pulsa|tagihan/)) return "Tagihan";
  return "Lainnya";
}

// Mendapatkan tanggal lokal WIB (Asia/Jakarta)
function getLocalDateWIB(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
}

export async function addTransaction(amount: number, description: string, fundSource: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const category = detectCategory(description);
  const date = getLocalDateWIB();

  await db.insert(transactions).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    amount,
    description: description || "Pengeluaran",
    category,
    fundSource,
    date,
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateTransaction(id: string, amount: number, description: string, fundSource: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const category = detectCategory(description);

  await db.update(transactions)
    .set({
      amount,
      description: description || "Pengeluaran",
      category,
      fundSource,
    })
    .where(eq(transactions.id, id));

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}

export async function deleteTransaction(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  await db.delete(transactions).where(eq(transactions.id, id));

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}
