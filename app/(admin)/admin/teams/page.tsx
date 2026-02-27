"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import { upsertTeam } from "@/lib/firestore";

export default function TeamsPage() {
  const [name, setName] = useState("Solar Dragons");
  return (
    <AuthGuard><RoleGuard role="admin">
      <div className="panel p-6 space-y-3">
        <h1 className="font-heading text-2xl">Quản lý đội</h1>
        <input className="w-full bg-black/40 p-2 rounded border border-white/20" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="energy-btn" onClick={() => upsertTeam(name.toLowerCase().replace(/\s+/g, "-"), { name, code: name.slice(0, 3).toUpperCase(), color: "#f97316", memberIds: [] })}>Tạo/Cập nhật đội</button>
      </div>
    </RoleGuard></AuthGuard>
  );
}
