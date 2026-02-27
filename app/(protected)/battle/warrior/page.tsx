"use client";

import { useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import { demoQuestions } from "@/data/demoQuestions";
import QuestionPanel from "@/components/battle/QuestionPanel";
import AnswerButtons from "@/components/battle/AnswerButtons";

export default function WarriorPage() {
  const questions = useMemo(() => demoQuestions.slice(0, 2), []);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const q = questions[idx];
  const pick = (ans: number) => {
    const ok = ans === q.correctIndex;
    if (ok) setScore((s) => s + 100);
    setFeedback(`${ok ? "✅ Chính xác" : "❌ Chưa đúng"}: ${q.explanation}`);
    setTimeout(() => {
      setFeedback(null);
      setIdx((x) => Math.min(questions.length - 1, x + 1));
    }, 1200);
  };

  return (
    <AuthGuard><RoleGuard role="student">
      <div className="space-y-4">
        <div className="panel p-3">Energy: <div className="h-3 rounded bg-white/20 mt-2"><div className="h-full bg-flame-gradient" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} /></div></div>
        <div className="panel p-3">Điểm: <span className="text-spark">{score}</span></div>
        <QuestionPanel question={q} index={idx} />
        <AnswerButtons options={q.options} onPick={pick} />
        {feedback && <div className="panel p-3">{feedback}</div>}
      </div>
    </RoleGuard></AuthGuard>
  );
}
