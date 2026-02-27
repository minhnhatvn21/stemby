"use client";

import { useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import { generateQuestionsAI } from "@/lib/ai-question-generator";
import { createQuestion } from "@/lib/firestore";
import { useAuth } from "@/lib/auth";
import { Question } from "@/types/question";

export default function AdminQuestionsPage() {
  const { appUser } = useAuth();
  const [generated, setGenerated] = useState<Array<Partial<Question>>>([]);

  return (
    <AuthGuard><RoleGuard role="admin">
      <div className="space-y-4">
        <h1 className="font-heading text-3xl">Question Forge AI</h1>
        <button className="energy-btn" onClick={async () => setGenerated(await generateQuestionsAI({ topic: "Điện gió", difficulty: "easy", amount: 3, ageGroup: "lớp 5" }))}>AI tạo 3 câu hỏi</button>
        <div className="space-y-2">
          {generated.map((q, idx) => (
            <div key={idx} className="panel p-3">
              <p>{q.question}</p>
              <button
                className="text-spark text-sm mt-2"
                onClick={() => createQuestion({ ...(q as Question), createdBy: appUser?.uid || "admin", status: "draft", moduleType: "warrior", source: "ai" })}
              >Lưu vào ngân hàng (draft)</button>
            </div>
          ))}
        </div>
      </div>
    </RoleGuard></AuthGuard>
  );
}
