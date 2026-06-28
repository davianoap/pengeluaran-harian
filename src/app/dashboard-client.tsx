"use client";

import { useState } from "react";
import { addTransaction, updateTransaction, deleteTransaction } from "./actions";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

const CATEGORIES = ["Debit", "Kartu Kredit BCA", "Kartu Kredit Danamon", "ShopeePayLater"];
const TEMPLATES = ["Makan Siang", "Makan Malam", "Skincare", "Jajan"];

// Format angka dengan titik ribuan (50000 → 50.000)
const formatNumber = (value: string): string => {
  const num = value.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseNumber = (value: string): number => Number(value.replace(/\./g, ""));

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString));
};

export default function DashboardClient({ user, transactions, todayTotal }: { user: any, transactions: any[], todayTotal: number }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fundSource, setFundSource] = useState("Debit");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Edit/Delete state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFundSource, setEditFundSource] = useState("Debit");
  const [editLoading, setEditLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = parseNumber(amount);
    if (!raw) return;
    setLoading(true);
    await addTransaction(raw, description, fundSource);
    setLoading(false);
    setOpen(false);
    setAmount("");
    setDescription("");
    setFundSource("Debit");
  };

  const openEditModal = (t: any) => {
    setSelectedTx(t);
    setEditAmount(formatNumber(Math.round(t.amount).toString()));
    setEditDesc(t.description);
    setEditFundSource(t.fundSource || "Debit");
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = parseNumber(editAmount);
    if (!selectedTx || !raw) return;
    setEditLoading(true);
    await updateTransaction(selectedTx.id, raw, editDesc, editFundSource);
    setEditLoading(false);
    setEditOpen(false);
    setSelectedTx(null);
  };

  const handleDeleteDirect = async (t: any) => {
    if (confirm(`Yakin ingin menghapus transaksi "${t.description || t.category}"?`)) {
      setEditLoading(true);
      await deleteTransaction(t.id);
      setEditLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  // Format currency with standard notation
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="relative px-6 pt-12 pb-8 z-10">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <Avatar onClick={handleLogout} className="w-12 h-12 ring-2 ring-primary/30 cursor-pointer hover:ring-primary transition-all duration-300 shadow-xl">
              <AvatarImage src={user.image} />
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Halo,</p>
              <h1 className="text-xl font-bold tracking-tight">{user.name}</h1>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full bg-white/5 hover:bg-white/10" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </Button>
        </div>
        
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2" suppressHydrationWarning>
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Hari ini, {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 drop-shadow-sm">
              {formatIDR(todayTotal)}
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 relative z-10 space-y-6">
        <div className="flex justify-between items-end">
          <h3 className="text-xl font-semibold tracking-tight">Transaksi Terakhir</h3>
          <Link href="/history" className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer">Lihat Semua</Link>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-2">✨</div>
              <h4 className="font-semibold text-lg">Belum Ada Pengeluaran</h4>
              <p className="text-sm text-muted-foreground">Catat pengeluaran pertamamu hari ini untuk melacak keuangan.</p>
            </div>
          ) : (
            transactions.map((t, i) => (
              <Card key={t.id} className="glass-panel border-0 bg-card/40 transition-all duration-300 rounded-2xl overflow-hidden group hover:bg-card/60 hover:shadow-primary/5">
                <div className="flex items-center p-3 gap-3">
                  <div className="flex-1 flex items-center justify-between border-r border-white/5 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center text-xl shadow-inner border border-white/5">
                        {t.category === 'Makanan' ? '🍔' : 
                         t.category === 'Transport' ? '🚗' : 
                         t.category === 'Belanja' ? '🛍️' : 
                         t.category === 'Hiburan' ? '🎬' : 
                         t.category === 'Tagihan' ? '💡' : '💸'}
                      </div>
                      <div>
                        <p className="font-semibold text-base mb-0.5">{t.description || t.category}</p>
                        <div className="flex gap-2 mb-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                            {t.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                            {t.fundSource || 'Debit'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <div className="font-bold text-lg text-foreground tracking-tight">
                      -{formatIDR(t.amount)}
                    </div>
                  </div>

                  {/* Action Buttons on the Right */}
                  <div className="flex flex-col gap-2">
                    <button onClick={() => openEditModal(t)} className="p-2 bg-primary/10 hover:bg-primary/30 text-primary rounded-xl transition-colors" title="Ubah">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteDirect(t)} className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-500 rounded-xl transition-colors" title="Hapus">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 border border-white/10 glass-panel shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">Ubah Pengeluaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 block">Sumber Dana</label>
                <select 
                  value={editFundSource}
                  onChange={(e) => setEditFundSource(e.target.value)}
                  className="w-full h-14 px-4 bg-black/20 border border-white/10 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all text-base appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 block">Nominal</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Rp</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={editAmount}
                    onChange={(e) => setEditAmount(formatNumber(e.target.value))}
                    className="pl-14 text-3xl h-16 font-bold bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 block">Uraian (Opsional)</label>
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Misal: Beli Kopi"
                  className="h-14 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary text-lg"
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg" disabled={editLoading}>
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Action Button */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger className="fixed bottom-8 left-1/2 -translate-x-1/2 rounded-full w-16 h-16 bg-gradient-to-br from-primary to-blue-600 text-white shadow-[0_0_40px_-10px_rgba(37,99,235,0.7)] flex items-center justify-center text-4xl hover:scale-110 active:scale-95 transition-all duration-300 z-50">
          <span className="relative bottom-[2px]">+</span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] p-0 border border-white/10 glass-panel shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-center">Catat Pengeluaran</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 block">Sumber Dana</label>
                <select 
                  value={fundSource}
                  onChange={(e) => setFundSource(e.target.value)}
                  className="w-full h-14 px-4 bg-black/20 border border-white/10 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all text-base appearance-none"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-background text-foreground">{cat}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground ml-1 block">Nominal</label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-muted-foreground group-focus-within:text-primary transition-colors">Rp</span>
                  <Input
                    type="text"
                    inputMode="numeric"
                    value={amount}
                    onChange={(e) => setAmount(formatNumber(e.target.value))}
                    className="pl-14 text-3xl h-16 font-bold bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary focus-visible:border-primary transition-all"
                    placeholder="0"
                    autoFocus
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-muted-foreground">Uraian (Opsional)</label>
                </div>
                
                {/* Template Chips */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDescription(t)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-black/20 text-muted-foreground border border-white/5 hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Misal: Beli Kopi"
                  className="h-14 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary text-lg"
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold mt-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Pengeluaran"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
