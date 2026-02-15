// components/shared/Header.tsx

'use client';

import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="relative z-20 flex items-center justify-between px-8 py-4 border-b border-white/5 bg-background-dark/80 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition">
        <div className="w-10 h-10 rounded bg-primary flex items-center justify-center" style={{
          boxShadow: '0 0 10px rgba(13, 127, 242, 0.5), 0 0 20px rgba(13, 127, 242, 0.3)',
        }}>
          <span className="text-xl">🏎️</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-widest text-white uppercase">
            AERO-DRAG <span className="text-primary">SIM</span>
          </h1>
          <p className="text-xs text-primary/80 tracking-[0.2em] font-medium">PHYSICS ENGINE V.2.0</p>
        </div>
      </Link>

      <div className="flex items-center gap-8">
        <div className="hidden md:flex gap-6 text-xs uppercase tracking-wider text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Server: Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Latency: 12ms</span>
          </div>
        </div>

        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">Cmdr. Pilot</p>
            <p className="text-xs text-primary">LVL 42 Engineer</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-dark border border-primary/30 overflow-hidden flex items-center justify-center">
            <span className="text-sm">👨‍✈️</span>
          </div>
        </div>
      </div>
    </header>
  );
}
