'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/assign', label: 'Assign Tasks' },
  { href: '/tasks', label: 'View Tasks' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-white/60 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">House Keeping Management Software</h1>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 rounded-full bg-slate-100/80 p-1 border border-white/60 shadow-inner">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                    isActive
                      ? 'bg-white shadow text-slate-900'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <nav className="flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-2 rounded-full border border-white/70 shadow">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-xs font-medium ${
                        isActive ? 'text-purple-600' : 'text-slate-500'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
