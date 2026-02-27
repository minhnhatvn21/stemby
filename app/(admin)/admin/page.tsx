"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import RoleGuard from "@/components/auth/RoleGuard";
import Link from "next/link";

export default function AdminHome() {
  return (
    <AuthGuard><RoleGuard role="admin">
      <div className="space-y-4">
        <h1 className="font-heading text-3xl">Admin Control Core</h1>
        <div className="grid md:grid-cols-4 gap-3">
          <div className="panel p-4">Học sinh: 0</div>
          <div className="panel p-4">Đội: 0</div>
          <div className="panel p-4">Câu hỏi: 0</div>
          <div className="panel p-4">Phiên live: 0</div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <Link href="/admin/questions" className="panel p-4">Quản lý câu hỏi</Link>
          <Link href="/admin/sessions" className="panel p-4">Quản lý phiên</Link>
          <Link href="/admin/teams" className="panel p-4">Quản lý đội</Link>
          <Link href="/admin/results" className="panel p-4">Kết quả & reset</Link>
        </div>
      </div>
    </RoleGuard></AuthGuard>
  );
}
