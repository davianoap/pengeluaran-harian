"use client";

import { useState } from "react";
import { updateTransaction, deleteTransaction } from "../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

const CATEGORIES = ["Debit", "Kartu Kredit BCA", "Kartu Kredit Danamon", "ShopeePayLater"];

// Format angka dengan titik ribuan (50000 → 50.000)
const formatNumber = (value: string): string => {
  const num = value.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseNumber = (value: string): number => Number(value.replace(/\./g, ""));

export default function HistoryClient({ initialTransactions }: { initialTransactions: any[] }) {
  const [filter, setFilter] = useState("Semua");
  const [fundSourceFilter, setFundSourceFilter] = useState("Semua");
  
  // Date Range state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const filterOptions = ["Semua", "Makanan", "Transport", "Belanja", "Hiburan", "Tagihan", "Lainnya"];
  const fundSourceOptions = ["Semua", ...CATEGORIES];

  const filteredTransactions = initialTransactions.filter(t => {
    const matchCategory = filter === "Semua" || t.category === filter;
    const matchFundSource = fundSourceFilter === "Semua" || (t.fundSource || "Debit") === fundSourceFilter;
    
    // Date filtering logic
    let matchDate = true;
    if (startDate && endDate) {
      matchDate = t.date >= startDate && t.date <= endDate;
    } else if (startDate) {
      matchDate = t.date >= startDate;
    } else if (endDate) {
      matchDate = t.date <= endDate;
    }

    return matchCategory && matchFundSource && matchDate;
  });

  // Calculate total for filtered transactions
  const totalFiltered = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by date
  const grouped = filteredTransactions.reduce((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {} as Record<string, any[]>);

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  // Edit/Delete state
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFundSource, setEditFundSource] = useState("Debit");
  const [editLoading, setEditLoading] = useState(false);

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

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative px-6 pt-12 pb-6 z-10 flex items-center gap-4">
        <Link href="/" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Riwayat Pengeluaran</h1>
      </header>

      <main className="px-6 relative z-10 space-y-4">
        {/* Total Summary */}
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-white/10 mb-6">
          <p className="text-sm font-semibold text-muted-foreground mb-1">Total Pengeluaran (Filter)</p>
          <h2 className="text-3xl font-bold tracking-tight text-white">{formatIDR(totalFiltered)}</h2>
        </div>

        {/* Date Range Filter */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 ml-1">Dari Tanggal</p>
            <Input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="h-12 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 ml-1">Sampai Tanggal</p>
            <Input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="h-12 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary text-sm"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 ml-1">Kategori</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {filterOptions.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                  filter === cat 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
                    : "bg-black/20 text-muted-foreground border-white/5 hover:bg-black/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Fund Source Filters */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 ml-1">Sumber Dana</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
            {fundSourceOptions.map((fs) => (
              <button
                key={fs}
                onClick={() => setFundSourceFilter(fs)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors border ${
                  fundSourceFilter === fs 
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/20" 
                    : "bg-black/20 text-muted-foreground border-white/5 hover:bg-black/40"
                }`}
              >
                {fs}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="space-y-6">
          {Object.keys(grouped).length === 0 ? (
            <div className="glass-panel p-8 rounded-3xl text-center flex flex-col items-center justify-center space-y-3 mt-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl mb-2">📭</div>
              <h4 className="font-semibold text-lg">Tidak Ada Data</h4>
              <p className="text-sm text-muted-foreground">Tidak ditemukan transaksi untuk filter ini.</p>
            </div>
          ) : (
            (Object.entries(grouped) as [string, any[]][]).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()).map(([date, ts]) => (
              <div key={date} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground sticky top-0 bg-background/80 backdrop-blur py-2 z-10">
                  {formatDate(date)}
                </h3>
                <div className="space-y-3">
                  {ts.map(t => (
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
                              <div className="flex gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary">
                                  {t.category}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                                  {t.fundSource || 'Debit'}
                                </span>
                              </div>
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
                  ))}
                </div>
              </div>
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
              <Button type="submit" className="w-full h-14 text-lg font-bold mt-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg" disabled={editLoading}>
                {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
