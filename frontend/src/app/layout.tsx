import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VedaAI – AI Assessment Creator',
  description:
    'Create AI-powered question papers instantly. Built for teachers who want to save time and create high-quality assessments.',
  keywords: ['AI', 'assessment', 'question paper', 'education', 'teacher tool'],
  openGraph: {
    title: 'VedaAI – AI Assessment Creator',
    description: 'Generate structured question papers with AI in seconds.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter bg-[#F8F9FE] text-[#2D3748] antialiased">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#1a1a2e',
              color: '#fff',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#00B894', secondary: '#fff' } },
            error: { iconTheme: { primary: '#E17055', secondary: '#fff' } },
          }}
        />
        {children}
      </body>
    </html>
  );
}
