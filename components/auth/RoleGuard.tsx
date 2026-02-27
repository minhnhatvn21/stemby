"use client";

import { useAuth } from "@/lib/auth";

export default function RoleGuard({ role, children }: { role: "admin" | "student"; children: React.ReactNode }) {
  const { appUser } = useAuth();
  if (!appUser) return null;
  if (role === "admin" && appUser.role !== "admin") {
    return <div className="panel p-6 text-center text-red-300">Không có quyền truy cập</div>;
  }
  if (role === "student" && appUser.role !== "student" && appUser.role !== "admin") {
    return <div className="panel p-6 text-center text-red-300">Không có quyền truy cập</div>;
  }
  return <>{children}</>;
}
