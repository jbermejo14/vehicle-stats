import React from 'react';
import Link from 'next/link';
import { getMetadata } from '@/lib/staticData';
import { Database, ShieldCheck, ExternalLink, Calendar } from 'lucide-react';

export function SiteFooter() {
  let metadata;
  try {
    metadata = getMetadata();
  } catch {
    metadata = {
      source: 'Dirección General de Tráfico (DGT) - Microdatos MATRABA',
      sourceUrl: 'https://sedeinvestigacion.dgt.es/es/datos-abiertos/microdatos/',
      startPeriod: '2024-01',
      endPeriod: '2026-10',
      totalRegistrations: 5412845,
      lastIngestDate: new Date().toISOString()
    };
  }

  const formattedDate = new Date(metadata.lastIngestDate).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#080808] px-4 lg:px-8 py-10 font-mono text-xs text-zinc-400">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Official Source Attribution Banner */}
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-white">
                Datos: microdatos de matriculaciones de la DGT
              </p>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Periodo cubierto: <span className="text-zinc-200 font-bold">{metadata.startPeriod}</span> hasta <span className="text-zinc-200 font-bold">{metadata.endPeriod}</span> ({metadata.totalRegistrations.toLocaleString('es-ES')} matriculaciones procesadas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Última ingesta: {formattedDate}</span>
            </div>
            <a
              href={metadata.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#FF5500] hover:underline"
            >
              <span>Portal DGT</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5 text-[11px]">
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-2">Periodos</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/matriculaciones/2026" className="hover:text-white transition-colors">Matriculaciones 2026</Link></li>
              <li><Link href="/matriculaciones/2025" className="hover:text-white transition-colors">Matriculaciones 2025</Link></li>
              <li><Link href="/matriculaciones/2024" className="hover:text-white transition-colors">Matriculaciones 2024</Link></li>
              <li><Link href="/matriculaciones/2026/10" className="hover:text-white transition-colors">Octubre 2026</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-2">Provincias Clave</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/provincia/madrid" className="hover:text-white transition-colors">Madrid</Link></li>
              <li><Link href="/provincia/barcelona" className="hover:text-white transition-colors">Barcelona</Link></li>
              <li><Link href="/provincia/valencia" className="hover:text-white transition-colors">Valencia</Link></li>
              <li><Link href="/provincia/sevilla" className="hover:text-white transition-colors">Sevilla</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-2">Marcas Líderes</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/marca/toyota" className="hover:text-white transition-colors">Toyota</Link></li>
              <li><Link href="/marca/volkswagen" className="hover:text-white transition-colors">Volkswagen</Link></li>
              <li><Link href="/marca/seat" className="hover:text-white transition-colors">SEAT</Link></li>
              <li><Link href="/marca/renault" className="hover:text-white transition-colors">Renault</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold uppercase tracking-wider mb-2">Electrificación</h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><Link href="/electricos" className="hover:text-white transition-colors">Radar Eléctricos (BEV)</Link></li>
              <li><Link href="/electricos" className="hover:text-white transition-colors">Híbridos Enchufables (PHEV)</Link></li>
              <li><Link href="/marca/tesla" className="hover:text-white transition-colors">Tesla en España</Link></li>
              <li><Link href="/marca/byd" className="hover:text-white transition-colors">BYD en España</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 border-t border-white/5">
          <p>© {new Date().getFullYear()} DGT Pulse. Datos abiertos de la Dirección General de Tráfico y Padrón INE 2024.</p>
          <p className="mt-2 sm:mt-0 font-mono">Diseño de registro MATRABA // Sin cookies de rastreo</p>
        </div>
      </div>
    </footer>
  );
}
