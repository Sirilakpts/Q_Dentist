'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'หน้าแรก' },
    { href: '/booking', label: 'จองคิว' },
    { href: '/tracking', label: 'ตรวจสอบคิว' },
    { href: '/staff', label: 'สำหรับเจ้าหน้าที่' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#063466] text-white border-b border-[#063466] no-print">
      {/* Top Gold Accent Bar */}
      <div className="h-1 bg-[#D5A423] w-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Municipal Dental Branding */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 group focus:outline-none"
          >
            {/* Minimal Geometric Dental Emblem */}
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-[#D5A423]/50 flex items-center justify-center text-[#D5A423] shrink-0 group-hover:bg-white/15 transition-colors">
              <svg className="w-6 h-6 fill-current icon-interactive icon-tilt" viewBox="0 0 24 24" width="24" height="24">
                <path d="M7 2C4.24 2 2 4.24 2 7c0 3.12 1.44 5.37 2.7 7.35C5.82 16.11 7 18 7 21a1 1 0 0 0 2 0c0-2.31-.83-3.61-1.78-5.1C6.18 14.28 5 12.44 5 10c0-1.65 1.35-3 3-3s3 1.35 3 3c0 .55.45 1 1 1s1-.45 1-1c0-1.65 1.35-3 3-3s3 1.35 3 3c0 2.44-1.18 4.28-2.22 5.9C15.83 17.39 15 18.69 15 21a1 1 0 0 0 2 0c0-3 1.18-4.89 2.3-6.65C20.56 12.37 22 10.12 22 7c0-2.76-2.24-5-5-5-2.21 0-4.08 1.44-4.73 3.44C11.62 3.44 9.75 2 7 2z" />
              </svg>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base sm:text-lg leading-tight tracking-tight">
                  ระบบจองคิวทันตกรรม
                </span>
                <span className="text-[10px] font-semibold bg-[#D5A423] text-[#063466] px-1.5 py-0.5 rounded leading-none">
                  เทศบาลนครบุรีรัมย์
                </span>
              </div>
              <span className="text-xs text-slate-300 leading-tight">
                ศูนย์บริการสาธารณสุข เทศบาลนครบุรีรัมย์
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const isStaff = link.href === '/staff';
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors min-h-[48px] inline-flex items-center ${
                    isActive
                      ? 'bg-white/15 text-[#D5A423] font-semibold'
                      : isStaff
                      ? 'text-slate-200 hover:text-white hover:bg-white/10 ml-2 border border-white/20'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white min-h-[48px] min-w-[48px] flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-[#D5A423]"
              aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation (No duplicate buttons) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#042345] px-4 py-2 space-y-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[48px] ${
                  isActive
                    ? 'bg-[#063466] text-[#D5A423] font-bold border-l-4 border-[#D5A423]'
                    : 'text-slate-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="text-xs text-[#D5A423]">●</span>}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
