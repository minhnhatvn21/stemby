"use client";

import Link from "next/link";
import { Flame } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { appUser, logout } = useAuth();
  return (
    <header className="border-b border-ember/60 bg-black/80 shadow-ember sticky top-0 z-40">
      <div className="mx-auto max-w-7xl flex items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-xl text-spark">
          <Flame className="text-flame" /> STEMBY BATTLE
        </Link>
        <nav className="flex gap-3 text-sm">
          {appUser && <Link href="/dashboard" className="hover:text-flame">Dashboard</Link>}
          {appUser?.role === "admin" && <Link href="/admin" className="hover:text-flame">Admin</Link>}
          {!appUser && <Link href="/auth/login" className="hover:text-flame">Login</Link>}
          {!appUser && <Link href="/auth/register" className="hover:text-flame">Register</Link>}
          {appUser && <button onClick={() => logout()} className="hover:text-flame">Logout</button>}
        </nav>
      </div>
    </header>
  );
}
