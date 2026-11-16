import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getPeriodData, getPeriodsIndex, getMetadata } from '@/lib/staticData';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Trophy, 
  Zap, 
  Fuel, 
  MapPin,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    año: string;
    mes: string;
  }>;
}

export async function generateStaticParams() {
  const periodsIndex = getPeriodsIndex();
  return periodsIndex.months.map((m) => {
    const monthPad = String(m.month).padStart(2, '0');
    return {
      año: String(m.year),
      mes: monthPad,
    };
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { año, mes } = await params;
  const periodId = `${año}-${mes.padStart(2, '0')}`;
  const data = getPeriodData(periodId);
  if (!data) return {};

  const totalStr = data.total.toLocaleString('es-ES');
  const yoyText = data.yoyPct !== null 
    ? ` (${data.yoyPct >= 0 ? '+' : ''}${data.yoyPct}% vs ${data.monthName} ${Number(año) - 1})` 
    : '';

  return constructMetadata({
    title: `Matriculaciones ${data.monthName} ${año} // ${totalStr} Vehículos`,
    description: `Microdatos oficiales DGT de matriculaciones en España durante ${data.monthName} de ${año}. ${totalStr} unidades registradas${yoyText}, mix energético, cuota de coches eléctricos y top marcas y modelos.`,
    canonicalPath: `/matriculaciones/${año}/${mes}`,
  });
}

export default async function MonthPage({ params }: PageProps) {
  const { año, mes } = await params;
  const periodId = `${año}-${mes.padStart(2, '0')}`;
  const data = getPeriodData(periodId);
  if (!data) notFound();

  const metadata = getMetadata();
  const total = data.total;
  const yoyPct = data.yoyPct;

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: `Matriculaciones ${año}`, item: `/matriculaciones/${año}` },
    { name: `${data.monthName}`, item: `/matriculaciones/${año}/${mes}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: `Microdatos DGT Matriculaciones ${data.monthName} ${año}`,
    description: `Registro oficial mensual de matriculaciones en España durante ${data.monthName} de ${año}. ${total.toLocaleString('es-ES')} vehículos.`,
    temporalCoverage: `${periodId}-01/${periodId}-28`,
    url: `/matriculaciones/${año}/${mes}`,
  });

  const fuels = data.fuels || {};
  const badges = data.badges || {};
  const topBrands = (data.brands || []).slice(0, 10);
  const topModels = (data.models || []).slice(0, 10);
  const topProvinces = (data.provinces || []).slice(0, 10);

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
          <Link href={`/matriculaciones/${año}`} className="hover:text-white transition-colors">Año {año}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FF5500] font-bold">{data.monthName}</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-[#FF5500] font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>Serie Mensual Oficial // Microdatos DGT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matriculaciones en España en {data.monthName} de {año}
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            En {data.monthName} de {año} se matricularon oficialmente{' '}
            <strong className="text-white font-bold">{total.toLocaleString('es-ES')} vehículos</strong> en el territorio nacional.
            {yoyPct !== null && (
              <span>
                {' '}En comparación con {data.monthName} de {Number(año) - 1} ({data.prevPeriodTotal?.toLocaleString('es-ES')} unidades), el mercado experimentó una variación del{' '}
                <strong className={yoyPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {yoyPct >= 0 ? `+${yoyPct}%` : `${yoyPct}%`}
                </strong>.
              </span>
            )}
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total del Mes</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {total.toLocaleString('es-ES')}
            </div>
            {yoyPct !== null && (
              <div className="flex items-center gap-1 text-xs mt-2 font-bold">
                {yoyPct >= 0 ? (
                  <>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">+{yoyPct}% interanual</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-400">{yoyPct}% interanual</span>
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
              <span className="text-white font-bold">{electrificadosPct}%</span> del mercado
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Marca Líder</span>
            <div className="text-xl sm:text-2xl font-bold text-white mt-1 truncate">
              {data.topBrand}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Líder de ventas del mes
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Modelo Más Vendido</span>
            <div className="text-xl sm:text-2xl font-bold text-[#FF5500] mt-1 truncate">
              {data.topModel}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Top 1 en matriculaciones
            </div>
          </div>
        </div>

        {/* Mix Energético y Etiquetas */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#FF5500]" />
              <span>Mix de Propulsión // {data.monthName} {año}</span>
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
              <span>Distintivos Ambientales // {data.monthName} {año}</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Etiqueta C (Verde)', count: badges.c || 0, color: '#10B981' },
                { label: 'Etiqueta ECO (Bicolor)', count: badges.eco || 0, color: '#00A651' },
                { label: 'Etiqueta 0 CERO (Azul)', count: badges.cero || 0, color: '#008ECE' },
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

        {/* Top Brands and Top Models */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Top 10 Marcas // {data.monthName} {año}</span>
            </h3>
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
                    <span className="text-zinc-400">{b.total.toLocaleString('es-ES')}</span>
                    <span className="text-white font-bold w-12 text-right">{b.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF5500]" />
              <span>Top 10 Modelos // {data.monthName} {año}</span>
            </h3>
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
                    <span className="text-zinc-400">{m.total.toLocaleString('es-ES')}</span>
                    <span className="text-white font-bold w-12 text-right">{m.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top Provinces of the month */}
        <section className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Top 10 Provincias con Mayor Volumen // {data.monthName} {año}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {topProvinces.map((p: any, idx: number) => (
              <Link
                key={p.code}
                href={`/provincia/${p.slug}`}
                className="p-3 rounded-lg bg-zinc-900/60 border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-bold">#{idx + 1}</span>
                  <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <div className="font-bold text-white group-hover:text-emerald-300 transition-colors mt-1">
                  {p.name}
                </div>
                <div className="text-xs text-zinc-400 mt-1">
                  {p.total.toLocaleString('es-ES')} <span className="text-[10px] text-zinc-500">regs</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Parent Year Link */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <Link
            href={`/matriculaciones/${año}`}
            className="text-[#FF5500] hover:underline flex items-center gap-1 font-bold"
          >
            <span>← Ver informe anual completo de {año}</span>
          </Link>
          <Link
            href="/electricos"
            className="text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>Radar de Vehículos Eléctricos e Híbridos →</span>
          </Link>
        </div>
      </div>
    </>
  );
}
