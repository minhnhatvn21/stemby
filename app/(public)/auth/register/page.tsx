"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register(email, password, displayName);
      toast.success("Tạo tài khoản thành công");
      router.push("/dashboard");
    } catch {
      toast.error("Không thể đăng ký");
    }
  };

  return (
    <form onSubmit={onSubmit} className="panel p-6 max-w-md mx-auto mt-10 space-y-3">
      <h1 className="font-heading text-2xl">Đăng ký học sinh</h1>
      <input className="w-full bg-black/40 p-2 rounded border border-white/20" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Tên hiển thị" />
      <input className="w-full bg-black/40 p-2 rounded border border-white/20" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" className="w-full bg-black/40 p-2 rounded border border-white/20" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
      <button className="energy-btn w-full">Register</button>
    </form>
  );
}
