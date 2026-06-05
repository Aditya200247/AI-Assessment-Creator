'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Users, ClipboardList, Wrench, BookOpen, Settings, Building2,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/groups', label: 'My Groups', icon: Users, exact: false },
  { href: '/', label: 'Assignments', icon: ClipboardList, badge: '30', exact: true },
  { href: '/create', label: "AI Teacher's Toolkit", icon: Wrench, exact: false },
  { href: '/library', label: 'My Library', icon: BookOpen, exact: false },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/') || pathname.startsWith(item.href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-[248px] bg-white border-r border-gray-100 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-4">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0095FF] to-[#00CFFF] flex items-center justify-center shadow-md shadow-blue-200 flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.24 2 3 4.24 3 7c0 1.8.9 3.4 2.3 4.4L5 13h6l-.3-1.6C12.1 10.4 13 8.8 13 7c0-2.76-2.24-5-5-5z" fill="white" fillOpacity="0.9"/>
            <circle cx="6" cy="7" r="1" fill="white"/>
            <circle cx="10" cy="7" r="1" fill="white"/>
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-[17px] tracking-tight">VedaAI</span>
      </div>

      {/* CTA */}
      <div className="px-4 mb-3">
        <Link
          href="/create"
          className="flex items-center gap-2.5 bg-[#1A1A2E] text-white rounded-2xl px-4 py-2.5 text-sm font-semibold w-full hover:bg-[#252550] transition-colors duration-150"
        >
          <Wrench className="w-4 h-4" />
          <span>AI Teacher's Toolkit</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-[#1A1A2E] text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <item.icon className="w-[17px] h-[17px] flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                  active ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
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
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 w-full transition-colors mb-2 text-left">
          <Settings className="w-[17px] h-[17px]" />
          Settings
        </button>
        <div className="flex items-center gap-3 px-3 py-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Building2 className="w-4 h-4 text-blue-500" />
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
