"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import { createSession } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";

export default function SessionsPage() {
  const { appUser } = useAuth();
  const [title, setTitle] = useState("Phiên Team Battle 01");
  return (
    <AuthGuard><RoleGuard role="admin">
      <div className="panel p-6 space-y-3">
        <h1 className="font-heading text-2xl">Quản lý phiên thi realtime</h1>
        <input className="w-full bg-black/40 p-2 rounded border border-white/20" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button className="energy-btn" onClick={() => createSession({ title, code: Math.random().toString(36).slice(2, 8).toUpperCase(), moduleType: "team-battle", status: "scheduled", questionIds: [], teamIds: [], startAt: new Date().toISOString(), questionDurationSec: 20, intervalSec: 5, createdBy: appUser?.uid || "admin" })}>Tạo session</button>
      </div>
    </RoleGuard></AuthGuard>
  );
}
