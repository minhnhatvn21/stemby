"use client";

import Link from "next/link";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import { useAuth } from "@/lib/auth";

export default function DashboardPage() {
  const { appUser } = useAuth();
  return (
    <AuthGuard>
      <RoleGuard role="student">
        <div className="grid gap-4">
          <section className="panel p-5">
            <h1 className="font-heading text-3xl">Xin chào {appUser?.displayName}</h1>
            <p>Tổng điểm: <strong className="text-spark">{appUser?.totalPoints ?? 0}</strong></p>
          </section>
          <section className="grid md:grid-cols-3 gap-4">
            <Link className="panel p-4 hover:border-flame" href="/battle/warrior">Module 1: Chiến Binh</Link>
            <Link className="panel p-4 hover:border-flame" href="/battle/team-battle">Module 2: Hợp Sức Tác Chiến</Link>
            <Link className="panel p-4 hover:border-flame" href="/battle/flash">Module 3: Nhanh Như Chớp</Link>
          </section>
        </div>
      </RoleGuard>
    </AuthGuard>
  );
}
