"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !appUser) router.push("/auth/login");
  }, [loading, appUser, router]);

  if (loading || !appUser) return <p>Đang xác thực...</p>;
  return <>{children}</>;
}
