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
        {/* App shell */}
        <div className="flex min-h-screen">
          <Sidebar />
          {/* Main — offset by sidebar width */}
          <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: '248px' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
