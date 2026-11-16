import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPeriodData, getPeriodsIndex, getMetadata } from '@/lib/staticData';
import { certainCeroCount, percentageOf, PHEV_BADGE_NOTE } from '@/lib/badgeCounts';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Zap, 
  Fuel, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    año: string;
  }>;
}

export async function generateStaticParams() {
  const metadata = getMetadata();
  return metadata.coveredYears.map((yr) => ({
    año: yr,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { año } = await params;
  const data = getPeriodData(año);
  if (!data) return {};

  const totalStr = data.total.toLocaleString('es-ES');
  const yoyText = data.yoyPct !== null 
    ? ` (${data.yoyPct >= 0 ? '+' : ''}${data.yoyPct}% vs año anterior)` 
    : '';

  return constructMetadata({
    title: `Matriculaciones en España ${año} // ${totalStr} Vehículos`,
    description: `Estadísticas de matriculaciones a partir de los microdatos de la DGT en España durante el año ${año}. Total de ${totalStr} registros${yoyText}, mix de combustibles (eléctricos, híbridos, gasolina, diésel) y ranking de marcas y modelos más vendidos.`,
    canonicalPath: `/matriculaciones/${año}`,
  });
}

export default async function YearPage({ params }: PageProps) {
  const { año } = await params;
  const data = getPeriodData(año);
  if (!data) notFound();

  const metadata = getMetadata();
  const total = data.total;
  const yoyDiff = data.yoyDiff;
  const yoyPct = data.yoyPct;

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: `Matriculaciones ${año}`, item: `/matriculaciones/${año}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: `Microdatos de Matriculaciones DGT en España - Año ${año}`,
    description: `Estadísticas de matriculación de vehículos en España durante ${año}. ${total.toLocaleString('es-ES')} vehículos registrados.`,
    temporalCoverage: `${año}-01-01/${año}-12-31`,
    url: `/matriculaciones/${año}`,
  });

  const fuels = data.fuels || {};
  const badges = data.badges || {};
  const months = data.months || [];
  const topBrands = (data.brands || []).slice(0, 10);
  const topModels = (data.models || []).slice(0, 10);

  const electrificadosTotal = (fuels.bev || 0) + (fuels.phev || 0);
  const electrificadosPct = total > 0 ? ((electrificadosTotal / total) * 100).toFixed(1) : '0';

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

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 font-mono space-y-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-white transition-colors">Inicio</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-zinc-500">Periodos</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FF5500] font-bold">{año}</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-[#FF5500] font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>Microdatos MATRABA // DGT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matriculaciones de Vehículos en España en {año}
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            Durante el año {año} se formalizaron un total de{' '}
            <strong className="text-white font-bold">{total.toLocaleString('es-ES')} matriculaciones</strong> en España según los microdatos de la Dirección General de Tráfico.
            {yoyPct !== null && (
              <span>
                {' '}Esto supone una variación interanual del{' '}
                <strong className={yoyPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {yoyPct >= 0 ? `+${yoyPct}%` : `${yoyPct}%`}
                </strong>{' '}
                respecto a las {data.prevPeriodTotal?.toLocaleString('es-ES')} unidades de {Number(año) - 1}.
              </span>
            )}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Matriculaciones</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {total.toLocaleString('es-ES')}
            </div>
            {yoyPct !== null && (
              <div className="flex items-center gap-1 text-xs mt-2 font-bold">
                {yoyPct >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">+{yoyPct}% vs {Number(año) - 1}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">{yoyPct}% vs {Number(año) - 1}</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Electrificados (BEV+PHEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">
              {electrificadosTotal.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{electrificadosPct}%</span> de cuota total
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Etiqueta 0 CERO (BEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-300 mt-1">
              {certainCeroCount(badges.cero || 0, fuels.phev || 0).toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              {percentageOf(certainCeroCount(badges.cero || 0, fuels.phev || 0), total)}% de las matriculaciones.{' '}
              {(fuels.phev || 0).toLocaleString('es-ES')} {PHEV_BADGE_NOTE}.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Etiqueta ECO</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              {(badges.eco || 0).toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              {total > 0 ? (((badges.eco || 0) / total) * 100).toFixed(1) : 0}% híbridos y gas
            </div>
          </div>
        </div>

        {/* Monthly Breakdown in this Year */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF5500]" />
              <span>Desglose Mensual en {año}</span>
            </h2>
            <span className="text-xs text-zinc-500">{months.length} meses registrados</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {months.map((m: any) => {
              const monthPad = String(m.month).padStart(2, '0');
              return (
                <Link
                  key={m.period}
                  href={`/matriculaciones/${año}/${monthPad}`}
                  className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-[#FF5500]/60 hover:bg-[#FF5500]/5 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white group-hover:text-[#FF5500] transition-colors">
                      {m.monthName}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-[#FF5500] transition-colors" />
                  </div>
                  <div className="text-lg font-bold text-zinc-200 mt-1.5">
                    {m.total.toLocaleString('es-ES')} <span className="text-xs font-normal text-zinc-500">veh.</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1 flex items-center justify-between">
                    <span>Líder: <strong className="text-zinc-300">{m.topBrand}</strong></span>
                    <span className="text-zinc-500">{m.topModel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Mix de Combustibles y Distintivos */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#FF5500]" />
              <span>Mix de Propulsión en {año}</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Gasolina', count: fuels.gasolina || 0, color: '#38BDF8' },
                { label: 'Híbrido (HEV)', count: fuels.hev || 0, color: '#10B981' },
                { label: 'Diésel', count: fuels.diesel || 0, color: '#F59E0B' },
                { label: 'Híbrido Enchufable (PHEV)', count: fuels.phev || 0, color: '#06B6D4' },
                { label: 'Eléctrico Puro (BEV)', count: fuels.bev || 0, color: '#008ECE' },
                { label: 'GLP / GNC', count: fuels.glpGnc || 0, color: '#A855F7' },
              ].map(item => {
                const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-white font-bold">{item.count.toLocaleString('es-ES')} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF5500]" />
              <span>Distintivos Ambientales DGT en {año}</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Etiqueta C (Verde)', count: badges.c || 0, color: '#10B981' },
                { label: 'Etiqueta ECO (Bicolor)', count: badges.eco || 0, color: '#00A651' },
                { label: 'Etiqueta 0 CERO (BEV)', count: certainCeroCount(badges.cero || 0, fuels.phev || 0), color: '#008ECE' },
                { label: PHEV_BADGE_NOTE, count: fuels.phev || 0, color: '#06B6D4' },
                { label: 'Etiqueta B (Amarilla)', count: badges.b || 0, color: '#EAB308' },
                { label: 'Sin Distintivo (A)', count: badges.sinEtiqueta || 0, color: '#EF4444' },
              ].map(item => {
                const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0';
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300">{item.label}</span>
                      <span className="text-white font-bold">{item.count.toLocaleString('es-ES')} ({pct}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top Brands and Models Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Brands */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>Top 10 Marcas en {año}</span>
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {topBrands.map((b: any, idx: number) => (
                <div key={b.brand} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 font-bold w-4">{idx + 1}.</span>
                    <Link
                      href={`/marca/${b.slug}`}
                      className="font-bold text-white hover:text-[#FF5500] transition-colors"
                    >
                      {b.brand}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{b.total.toLocaleString('es-ES')} regs</span>
                    <span className="text-white font-bold w-12 text-right">{b.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Models */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FF5500]" />
                <span>Top 10 Modelos en {año}</span>
              </h3>
            </div>
            <div className="divide-y divide-white/5">
              {topModels.map((m: any, idx: number) => (
                <div key={m.fullName} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 font-bold w-4">{idx + 1}.</span>
                    <Link
                      href={`/marca/${m.brandSlug}/${m.modelSlug}`}
                      className="font-bold text-white hover:text-[#FF5500] transition-colors truncate max-w-[200px]"
                    >
                      {m.fullName}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{m.total.toLocaleString('es-ES')} regs</span>
                    <span className="text-white font-bold w-12 text-right">{m.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Years Navigation */}
        <section className="pt-6 border-t border-white/10 flex flex-wrap gap-2 text-xs">
          <span className="text-zinc-500 self-center mr-2">Otros Años:</span>
          {metadata.coveredYears.map((yr) => (
            <Link
              key={yr}
              href={`/matriculaciones/${yr}`}
              className={`px-3 py-1.5 rounded-lg border font-mono transition-colors ${
                yr === año
                  ? 'bg-[#FF5500] text-black border-[#FF5500] font-bold'
                  : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:border-white/30'
              }`}
            >
              Año {yr}
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
