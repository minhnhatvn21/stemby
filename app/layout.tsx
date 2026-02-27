import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";
import Header from "@/components/ui/Header";

export const metadata: Metadata = {
  title: "STEMBY Battle",
  description: "Đấu trường năng lượng xanh"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-7xl p-4">{children}</main>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
