'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, ClipboardList, Wrench, BookOpen, Settings, Building2,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home, key: 'home' },
  { href: '/groups', label: 'My Groups', icon: Users, key: 'groups' },
  { href: '/', label: 'Assignments', icon: ClipboardList, badge: '30', key: 'assignments' },
  { href: '/create', label: "AI Teacher's Toolkit", icon: Wrench, key: 'toolkit' },
  { href: '/library', label: 'My Library', icon: BookOpen, key: 'library' },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    // Assignments is active on the dashboard and individual assignment pages
    if (item.key === 'assignments') {
      return pathname === '/' || pathname.startsWith('/assignment/');
    }
    // Home is never active (it links to same place as Assignments but isn't the active tab)
    if (item.key === 'home') return false;
    // Create page — toolkit active
    if (item.key === 'toolkit') return pathname === '/create';
    // Others by path prefix
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <aside className="w-full lg:w-[260px] bg-white rounded-[20px] lg:rounded-[24px] shadow-sm flex flex-col h-auto lg:h-full flex-shrink-0 lg:flex-none border border-gray-100/50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 3H9.2L12 13.5L14.8 3H21L14.5 21H9.5L3 3Z" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-[18px] tracking-tight">VedaAI</span>
      </div>

      {/* CTA */}
      <div className="px-4 mb-3">
        <Link
          href="/create"
          className="flex items-center justify-center gap-2 bg-[#FF5B35] text-white rounded-[16px] px-4 py-2.5 text-sm font-semibold w-full hover:bg-[#E54E29] transition-colors duration-150"
        >
          <span className="text-lg font-bold leading-none">+</span>
          <span>AI Teacher's Toolkit</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#F3F4F6] text-gray-900 font-semibold'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]'
              }`}
            >
              <item.icon className={`w-[17px] h-[17px] flex-shrink-0 ${active ? 'text-gray-900' : 'text-[#9CA3AF]'}`} />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  active ? 'bg-gray-200 text-gray-800' : 'bg-red-550/0 bg-[#FFF0ED] text-[#FF5B35]'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-2">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827] w-full transition-colors mb-2 text-left">
          <Settings className="w-[17px] h-[17px] text-[#9CA3AF]" />
          Settings
        </button>
        <div className="flex items-center gap-3 px-3 py-3 bg-white border border-gray-150 rounded-[16px] shadow-sm">
          <div className="w-9 h-9 rounded-full border border-emerald-100 flex items-center justify-center bg-emerald-50/50 flex-shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
              <path d="M6 10C6 6.68629 8.68629 4 12 4C15.3137 4 18 6.68629 18 10C18 13.3137 15.3137 16 12 16C8.68629 16 6 13.3137 6 10Z" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3"/>
              <path d="M12 7V13M10 9H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">Delhi Public School</p>
            <p className="text-[11px] text-gray-400 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
