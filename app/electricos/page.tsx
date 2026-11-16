import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { getElectricosData, getMetadata } from '@/lib/staticData';
import { PHEV_BADGE_NOTE } from '@/lib/badgeCounts';
import { PHEV_MIN_CERO_RANGE_KM } from '@/lib/dgtBadge';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  Zap, 
  BatteryCharging, 
  TrendingUp, 
  MapPin, 
  Trophy, 
  Calendar, 
  ChevronRight,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Vehículos eléctricos e híbridos enchufables en España',
  description: 'Estadísticas de coches eléctricos puros (BEV) e híbridos enchufables (PHEV) en España basada en microdatos DGT. Evolución mensual, cuota de mercado, ranking por provincias y marcas líderes de electrificación.',
  canonicalPath: '/electricos',
});

export default function ElectricosPage() {
  const data = getElectricosData();
  const metadata = getMetadata();

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: 'Vehículos Eléctricos', item: '/electricos' },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: 'Microdatos DGT de Vehículos Eléctricos e Híbridos Enchufables en España',
    description: `Estadísticas de vehículos eléctricos e híbridos enchufables en España a partir de los microdatos de la DGT. ${data.totalElectrificados.toLocaleString('es-ES')} vehículos electrificados registrados.`,
    temporalCoverage: `${metadata.startPeriod}-01/${metadata.endPeriod}-28`,
    url: '/electricos',
  });

  const evolution = data.monthlyEvolution || [];
  const topProvinces = data.topProvincesBev || [];
  const topBrands = data.topBrandsElectrificadas || [];

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
          <span className="text-[#FF5500] font-bold">Vehículos Eléctricos</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-bold uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4" />
            <span>Transición Energética // Eléctricos e híbridos enchufables</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Radar de Vehículos Eléctricos (BEV) y PHEV en España
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            España cuenta con un acumulado de{' '}
            <strong className="text-white font-bold">{data.totalElectrificados.toLocaleString('es-ES')} vehículos enchufables</strong> registrados entre {metadata.startPeriod} y {metadata.endPeriod}, desglosados en{' '}
            <strong className="text-sky-400 font-bold">{data.totalBev.toLocaleString('es-ES')} eléctricos 100% (BEV)</strong> ({data.bevPctOfTotal}% de penetración) y{' '}
            <strong className="text-cyan-300 font-bold">{data.totalPhev.toLocaleString('es-ES')} híbridos enchufables (PHEV)</strong> ({data.phevPctOfTotal}% del mercado).
          </p>
          <p className="text-xs text-zinc-500 mt-2 max-w-3xl leading-relaxed">
            {PHEV_BADGE_NOTE}: la DGT concede la etiqueta CERO a los PHEV con {PHEV_MIN_CERO_RANGE_KM} km o más de autonomía y ECO al resto. Los microdatos no incluyen la autonomía, así que los PHEV no se reparten entre ambas etiquetas.
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Enchufables (BEV+PHEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">
              {data.totalElectrificados.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{data.electrificadosPctOfTotal}%</span> del mercado total
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">100% Eléctricos Puros (BEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-300 mt-1">
              {data.totalBev.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{data.bevPctOfTotal}%</span> cuota neta BEV
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Híbridos Enchufables (PHEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-1">
              {data.totalPhev.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{data.phevPctOfTotal}%</span> cuota neta PHEV
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Provincias Líderes</span>
            <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 truncate">
              {topProvinces[0]?.name || 'Madrid'}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Mayor penetración de BEV
            </div>
          </div>
        </div>

        {/* Monthly Evolution of EV and PHEV */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-sky-400" />
              <span>Evolución Mensual de la Electrificación en España</span>
            </h2>
            <span className="text-xs text-zinc-500">{evolution.length} meses analizados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {evolution.slice(-12).map((m: any) => {
              const [year, month] = m.period.split('-');
              return (
                <Link
                  key={m.period}
                  href={`/matriculaciones/${year}/${month}`}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-sky-400/60 transition-colors group"
                >
                  <span className="text-[11px] text-zinc-400 block group-hover:text-sky-400 transition-colors font-bold">
                    {m.period}
                  </span>
                  <div className="text-sm font-bold text-sky-400 mt-1">
                    {m.bev.toLocaleString('es-ES')} <span className="text-[10px] text-zinc-500">BEV</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    +{m.phev.toLocaleString('es-ES')} PHEV ({m.phevPct}%)
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Top Provinces and Top Brands Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Provinces by EV Adoption */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Provincias con Mayor Penetración de Eléctricos (%)</span>
            </h3>
            <div className="divide-y divide-white/5">
              {topProvinces.map((p: any, idx: number) => (
                <div key={p.slug} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 font-bold w-4">#{idx + 1}</span>
                    <Link
                      href={`/provincia/${p.slug}`}
                      className="font-bold text-white hover:text-emerald-400 transition-colors"
                    >
                      {p.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{p.total.toLocaleString('es-ES')} veh.</span>
                    <span className="text-sky-400 font-bold w-12 text-right">{p.bevPercentage}% BEV</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Brands Leading Electrification */}
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF5500]" />
              <span>Marcas con Mayor Cuota Electrificada (ECO / 0 CERO)</span>
            </h3>
            <div className="divide-y divide-white/5">
              {topBrands.map((b: any, idx: number) => (
                <div key={b.slug} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-zinc-500 font-bold w-4">#{idx + 1}</span>
                    <Link
                      href={`/marca/${b.slug}`}
                      className="font-bold text-white hover:text-[#FF5500] transition-colors"
                    >
                      {b.brand}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">{b.total.toLocaleString('es-ES')} regs</span>
                    <span className="text-emerald-400 font-bold w-14 text-right">{b.eco0Percentage}% ECO/0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
