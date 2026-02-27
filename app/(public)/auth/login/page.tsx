"use client";

import { FormEvent, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Đăng nhập thành công");
      router.push("/dashboard");
    } catch {
      toast.error("Sai thông tin đăng nhập");
    }
  };

  return (
    <form onSubmit={onSubmit} className="panel p-6 max-w-md mx-auto mt-10 space-y-3">
      <h1 className="font-heading text-2xl">Đăng nhập</h1>
      <input className="w-full bg-black/40 p-2 rounded border border-white/20" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" className="w-full bg-black/40 p-2 rounded border border-white/20" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" />
      <button className="energy-btn w-full">Login</button>
    </form>
  );
}
