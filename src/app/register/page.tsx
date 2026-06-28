"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      name,
      email,
      password,
    });
    setLoading(false);
    
    if (data) {
      router.push("/");
    } else {
      alert(error?.message || "Gagal mendaftar");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorators */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />

      <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl rounded-[2rem] relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
        <CardHeader className="text-center pt-10 pb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-inner border border-white/10">
            <span className="text-3xl">✨</span>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight mb-2">Daftar Akun</CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Mulai kebiasaan baik mencatat keuanganmu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-5 px-8">
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold text-muted-foreground ml-1">Nama Panggilan</Label>
              <Input 
                id="name" 
                placeholder="Budi" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-14 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary px-4 text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="email" className="text-sm font-semibold text-muted-foreground ml-1">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nama@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-14 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary px-4 text-base"
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-semibold text-muted-foreground ml-1">Kata Sandi</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                placeholder="Minimal 8 karakter"
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-14 bg-black/20 border-white/10 rounded-2xl focus-visible:ring-primary px-4 text-base"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-6 px-8 pb-10 pt-4">
            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-lg" disabled={loading}>
              {loading ? "Memuat..." : "Buat Akun"}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Sudah punya akun? <Link href="/login" className="text-primary font-semibold hover:underline">Masuk di sini</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
