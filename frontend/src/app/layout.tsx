import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
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
      <body className="font-inter antialiased bg-[#F4F5F7]">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              background: '#1A1A2E',
              color: '#fff',
              padding: '12px 16px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
            },
            success: { iconTheme: { primary: '#22C55E', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
        <div className="flex flex-col lg:flex-row h-screen bg-[#F3F4F6] p-4 lg:p-5 gap-4 lg:gap-5 overflow-hidden">
          <Sidebar />
          {/* Main — Floating card container */}
          <main className="flex-1 bg-white rounded-[20px] lg:rounded-[24px] shadow-sm flex flex-col h-full overflow-hidden min-w-0">
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
