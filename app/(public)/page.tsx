import Link from "next/link";
import FireBackgroundCanvas from "@/components/effects/FireBackgroundCanvas";
import EmbersParticles from "@/components/effects/EmbersParticles";

export default function LandingPage() {
  return (
    <section className="relative overflow-hidden rounded-xl panel p-10 min-h-[70vh] flex flex-col justify-center">
      <FireBackgroundCanvas />
      <EmbersParticles />
      <p className="uppercase tracking-widest text-flame">Năng lượng xanh • STEM tiểu học</p>
      <h1 className="text-5xl font-heading max-w-3xl mt-2">STEMBY BATTLE: Đấu Trường Năng Lượng Bền Vững</h1>
      <p className="mt-4 max-w-2xl text-yellow-100/90">3 module thi đấu: Chiến Binh luyện tập, Hợp Sức Tác Chiến tranh bản đồ, Nhanh Như Chớp phản xạ realtime.</p>
      <div className="flex gap-3 mt-8">
        <Link href="/auth/login" className="energy-btn">Vào chiến trường</Link>
        <Link href="/auth/register" className="panel px-4 py-2">Tạo tài khoản</Link>
      </div>
    </section>
  );
}
