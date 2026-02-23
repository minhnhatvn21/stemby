import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const vietnameseFont = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-body'
});

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
      <body className={vietnameseFont.variable}>{children}</body>
    </html>
  );
}
