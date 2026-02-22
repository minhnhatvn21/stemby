import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Arena Năng Lượng Xanh',
  description: 'Ứng dụng STEM giúp học sinh luyện thói quen sống xanh.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
