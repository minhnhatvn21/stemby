"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import Countdown from "@/components/ui/Countdown";
import ScoreboardRealtime from "@/components/battle/ScoreboardRealtime";
import { useState } from "react";

export default function FlashPage() {
  const [scores, setScores] = useState<Record<string, number>>({ "player-1": 100, "player-2": 50 });
  return (
    <AuthGuard><RoleGuard role="student">
      <div className="space-y-4">
        <section className="panel p-6 text-center">
          <h1 className="font-heading text-3xl">Nhanh Như Chớp</h1>
          <p className="mb-4">Trả lời nhanh và chính xác để chiếm câu hỏi!</p>
          <Countdown target={20} />
          <button className="energy-btn mt-4" onClick={() => setScores((s) => ({ ...s, "player-1": s["player-1"] + 100 }))}>Trả lời đúng siêu tốc</button>
        </section>
        <ScoreboardRealtime scores={scores} />
      </div>
    </RoleGuard></AuthGuard>
  );
}
