import React from 'react';
import Link from 'next/link';
import { Activity, Zap, MapPin, Tag, Calendar } from 'lucide-react';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-[#FF5500]/15 border border-[#FF5500]/40 flex items-center justify-center text-[#FF5500] group-hover:border-[#FF5500] group-hover:bg-[#FF5500]/25 transition-all">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base tracking-wider text-white">DGT PULSE</span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono uppercase bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 rounded">Oficial</span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono hidden sm:block">Microdatos Oficiales MATRABA</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-mono">
          <Link
            href="/"
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            Resumen
          </Link>
          <Link
            href="/electricos"
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-sky-400" />
            <span>Eléctricos</span>
          </Link>
          <Link
            href="/matriculaciones/2026"
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="hidden sm:inline">Periodos</span>
          </Link>
          <Link
            href="/provincia/madrid"
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Provincias</span>
          </Link>
          <Link
            href="/marca/toyota"
            className="px-2.5 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Marcas</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
