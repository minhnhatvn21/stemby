"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";

export default function ResultsPage() {
  return (
    <AuthGuard><RoleGuard role="admin">
      <div className="panel p-6 space-y-3">
        <h1 className="font-heading text-2xl">Kết quả & Vinh danh</h1>
        <p>Top đội: Solar Dragons • Top cá nhân: player-1</p>
        <button className="energy-btn">Reset phiên (có xác nhận ở bản production nâng cao)</button>
      </div>
    </RoleGuard></AuthGuard>
  );
}
