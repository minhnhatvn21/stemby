"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { appUser } = useAuth();
  return <AuthGuard><div className="panel p-6">Hồ sơ: {appUser?.displayName} ({appUser?.email})</div></AuthGuard>;
}
