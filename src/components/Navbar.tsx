'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProtocol } from '@/lib/protocol-context';

export function Navbar() {
  const pathname = usePathname();
  const { selectedCompoundIds } = useProtocol();
  const selectedCount = selectedCompoundIds.size;

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-blue-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold text-xl bg-gradient-to-r from-blue-400 via-violet-400 to-blue-300 bg-clip-text text-transparent hover:from-blue-300 hover:to-violet-300 transition-all">
            The Longevity Navigator
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <Link
              href="/"
              className={`text-sm font-medium transition-all px-3 py-2 relative ${
                isActive('/')
                  ? 'text-blue-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Home
              {isActive('/') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 rounded-full" />
              )}
            </Link>
            <Link
              href="/browse"
              className={`text-sm font-medium transition-all px-3 py-2 relative ${
                isActive('/browse')
                  ? 'text-blue-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Browse
              {isActive('/browse') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 rounded-full" />
              )}
            </Link>
            <Link
              href="/recommend"
              className={`text-sm font-medium transition-all px-3 py-2 relative ${
                isActive('/recommend')
                  ? 'text-blue-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Recommend
              {isActive('/recommend') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 rounded-full" />
              )}
            </Link>
            <Link
              href="/compare"
              className={`text-sm font-medium transition-all px-3 py-2 relative ${
                isActive('/compare')
                  ? 'text-blue-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compare
              {isActive('/compare') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 rounded-full" />
              )}
            </Link>
            <Link
              href="/protocol"
              className={`relative text-sm font-medium transition-all px-3 py-2 flex items-center gap-2 ${
                isActive('/protocol')
                  ? 'text-blue-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Protocol
              {isActive('/protocol') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-violet-400 rounded-full" />
              )}
              {selectedCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-full shadow-lg shadow-blue-500/50">
                  {selectedCount}
                </span>
              )}
            </Link>
            <Link
              href="/onboarding"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-400 hover:to-violet-400 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-blue-500/30 border border-blue-400/20 backdrop-blur-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
