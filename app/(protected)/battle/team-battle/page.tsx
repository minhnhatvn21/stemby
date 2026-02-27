"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import MapGrid from "@/components/battle/MapGrid";
import ScoreboardRealtime from "@/components/battle/ScoreboardRealtime";
import { listenLiveSessions, submitAnswerOnce } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { QRCodeSVG } from "qrcode.react";

export default function TeamBattlePage() {
  const { appUser } = useAuth();
  const [scores, setScores] = useState<Record<string, number>>({ TeamA: 300, TeamB: 200 });
  const [owners] = useState<Record<string, string>>({ 0: "#f97316", 1: "#ef4444", 2: "#facc15" });
  const [sessionCode, setSessionCode] = useState("STEM2026");

  useEffect(() => listenLiveSessions((rows) => rows[0]?.code && setSessionCode(rows[0].code)), []);

  return (
    <AuthGuard><RoleGuard role="student">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="panel p-4 space-y-4">
          <h1 className="font-heading text-2xl">Hợp Sức Tác Chiến</h1>
          <MapGrid owners={owners} />
          <button
            className="energy-btn"
            onClick={async () => {
              await submitAnswerOnce({
                sessionId: "demo-session",
                questionId: "q1",
                actorId: appUser?.uid || "guest",
                answerIndex: 1,
                isCorrect: true,
                moduleType: "team-battle",
                teamId: appUser?.teamId || "TeamA"
              });
              setScores((s) => ({ ...s, TeamA: (s.TeamA || 0) + 100 }));
            }}
          >Gửi đáp án demo</button>
        </div>
        <div className="space-y-4">
          <div className="panel p-4"><p>Session code: <strong>{sessionCode}</strong></p><QRCodeSVG value={sessionCode} bgColor="transparent" fgColor="#ffc400" /></div>
          <ScoreboardRealtime scores={scores} />
        </div>
      </div>
    </RoleGuard></AuthGuard>
  );
}
