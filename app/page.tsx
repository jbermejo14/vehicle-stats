import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getOverview, getMetadata, getPeriodsIndex, getProvincesIndex, getBrandsIndex } from '@/lib/staticData';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { InteractiveDashboard } from '@/components/dashboard/InteractiveDashboard';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Trophy, 
  MapPin, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Matriculaciones de Vehículos en España // Estadísticas Oficiales DGT',
  description: 'Telemetría y análisis de más de 5,4M de matriculaciones en España basadas en microdatos oficiales MATRABA de la DGT. Estadísticas del último mes, series históricas, coches eléctricos, mapa provincial y cuota de marcas.',
  canonicalPath: '/',
});

export default function HomePage() {
  const overview = getOverview();
  const metadata = getMetadata();
  const provinces = getProvincesIndex().slice(0, 8);
  const brands = getBrandsIndex().slice(0, 8);

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: 'Microdatos de Matriculaciones de Vehículos en España (DGT MATRABA)',
    description: `Conjunto de datos oficial de ${overview.totalRegistrations.toLocaleString('es-ES')} matriculaciones procesadas de la Dirección General de Tráfico.`,
    temporalCoverage: `${metadata.startPeriod}-01/${metadata.endPeriod}-28`,
    url: '/',
  });

  const latestMonth = overview.latestMonth;
  const latestYearSummary = overview.latestYearSummary;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8 font-mono space-y-10">
        {/* Visible Hero & Main Heading (H1 Visible) */}
        <div className="border-b border-white/10 pb-8">
          <div className="flex items-center gap-2 text-xs text-[#FF5500] font-bold uppercase tracking-wider mb-2">
            <Activity className="w-4 h-4" />
            <span>Portal Oficial de Microdatos // DGT MATRABA</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Matriculaciones de Vehículos en España
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-3xl leading-relaxed">
            Consola analítica y estadísticas sobre los{' '}
            <strong className="text-white font-bold">{overview.totalRegistrations.toLocaleString('es-ES')} registros oficiales</strong> procesados de la Dirección General de Tráfico desde {metadata.startPeriod} hasta {metadata.endPeriod}. Cada cifra procede directamente del diseño de registro MATRABA sin estimaciones sintéticas.
          </p>
        </div>

        {/* Resumen del Último Mes y del Último Año (Requisito 7) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF5500]" />
              <span>Resumen Oficial: Último Mes & Último Año</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Actualizado: {metadata.endPeriod}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tarjeta Último Mes */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Último Mes: {overview.latestMonthName} {overview.latestYear}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                  {latestMonth.period}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {latestMonth.total.toLocaleString('es-ES')}
                <span className="text-xs font-normal text-zinc-500 ml-2">vehículos</span>
              </div>
              {latestMonth.yoyPct !== null && (
                <div className="flex items-center gap-1.5 text-xs font-bold pt-1">
                  {latestMonth.yoyPct >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">+{latestMonth.yoyPct}% vs {overview.latestMonthName} {overview.latestYear - 1}</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">{latestMonth.yoyPct}% vs {overview.latestMonthName} {overview.latestYear - 1}</span>
                    </>
                  )}
                </div>
              )}
              <div className="text-xs text-zinc-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>Marca líder: <strong className="text-white">{latestMonth.topBrand}</strong></span>
                <Link
                  href={`/matriculaciones/${overview.latestYear}/${String(latestMonth.period.split('-')[1]).padStart(2, '0')}`}
                  className="text-[#FF5500] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Ver detalle</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tarjeta Último Año */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Año en Curso: {overview.latestYear}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-zinc-300 border border-white/10">
                  {latestYearSummary.monthsCount} meses
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white">
                {latestYearSummary.total.toLocaleString('es-ES')}
                <span className="text-xs font-normal text-zinc-500 ml-2">unidades</span>
              </div>
              <p className="text-xs text-zinc-400 pt-1">
                Acumulado anual procesado hasta {overview.latestMonthName} de {overview.latestYear}.
              </p>
              <div className="text-xs text-zinc-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>Año completo previo: <strong className="text-zinc-200">2025</strong></span>
                <Link
                  href={`/matriculaciones/${overview.latestYear}`}
                  className="text-[#FF5500] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Ver año {overview.latestYear}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Tarjeta Serie Histórica Completa */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                  Histórico Consolidado
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  {metadata.totalMonths} meses
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                {overview.totalRegistrations.toLocaleString('es-ES')}
                <span className="text-xs font-normal text-zinc-500 ml-2">registros</span>
              </div>
              <p className="text-xs text-zinc-400 pt-1">
                100% microdatos verificados desde {metadata.startPeriod} hasta {metadata.endPeriod}.
              </p>
              <div className="text-xs text-zinc-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>Transición ECO: <strong className="text-white">{overview.topBrands[0]?.brand || 'Toyota'}</strong></span>
                <Link
                  href="/electricos"
                  className="text-sky-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <span>Radar Eléctricos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links Hub: Periodos, Provincias, Marcas */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Periodos Destacados */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Periodos y Años</span>
              </h3>
              <Link href="/matriculaciones/2026" className="text-[11px] text-[#FF5500] hover:underline">Ver todos</Link>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Link href="/matriculaciones/2026" className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-[#FF5500] text-zinc-200">Año 2026</Link>
              <Link href="/matriculaciones/2025" className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-[#FF5500] text-zinc-200">Año 2025</Link>
              <Link href="/matriculaciones/2024" className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-[#FF5500] text-zinc-200">Año 2024</Link>
              <Link href="/matriculaciones/2026/10" className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-[#FF5500] text-zinc-200">Octubre 2026</Link>
            </div>
          </div>

          {/* Provincias Destacadas */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Provincias Clave</span>
              </h3>
              <Link href="/provincia/madrid" className="text-[11px] text-emerald-400 hover:underline">Ver todas</Link>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {provinces.slice(0, 5).map(p => (
                <Link key={p.slug} href={`/provincia/${p.slug}`} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-emerald-500 text-zinc-200">
                  {p.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Marcas Líderes */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span>Marcas Principales</span>
              </h3>
              <Link href="/marca/toyota" className="text-[11px] text-amber-400 hover:underline">Ver ranking</Link>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {brands.slice(0, 5).map(b => (
                <Link key={b.slug} href={`/marca/${b.slug}`} className="px-2.5 py-1 rounded bg-zinc-900 border border-white/10 hover:border-amber-400 text-zinc-200">
                  {b.brand}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Consola Interactiva Completa */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#FF5500]" />
              <span>Consola Interactiva de Telemetría Automotriz</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono hidden sm:inline">Exploración profunda de microdatos</span>
          </div>

          <InteractiveDashboard />
        </div>
      </div>
    </>
  );
}
