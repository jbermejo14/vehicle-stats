import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getProvinceData, getProvincesIndex, getMetadata } from '@/lib/staticData';
import { certainCeroCount, percentageOf, PHEV_BADGE_NOTE } from '@/lib/badgeCounts';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  MapPin, 
  Users, 
  Zap, 
  Trophy, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Building2
} from 'lucide-react';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    provincia: string;
  }>;
}

export async function generateStaticParams() {
  const provinces = getProvincesIndex();
  return provinces.map((p) => ({
    provincia: p.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provincia } = await params;
  const data = getProvinceData(provincia);
  if (!data) return {};

  const totalStr = data.total.toLocaleString('es-ES');
  const per1000Str = data.per1000Habitantes?.toLocaleString('es-ES');

  return constructMetadata({
    title: `Matriculaciones en ${data.name} // ${totalStr} vehículos`,
    description: `Estadísticas de matriculaciones a partir de los microdatos de la DGT en la provincia de ${data.name} (${data.community}). Total de ${totalStr} vehículos, tasa de ${per1000Str} veh/1.000 hab. (INE 2024), cuota de coches eléctricos (BEV/PHEV) y marcas líderes.`,
    canonicalPath: `/provincia/${provincia}`,
  });
}

export default async function ProvincePage({ params }: PageProps) {
  const { provincia } = await params;
  const data = getProvinceData(provincia);
  if (!data) notFound();

  const metadata = getMetadata();
  const allProvinces = getProvincesIndex();

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: 'Provincias', item: '/provincia/madrid' },
    { name: data.name, item: `/provincia/${provincia}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: `Microdatos DGT Matriculaciones en ${data.name}`,
    description: `Vehículos matriculados en la provincia de ${data.name}. Total histórico de ${data.total.toLocaleString('es-ES')} unidades.`,
    temporalCoverage: `${metadata.startPeriod}-01/${metadata.endPeriod}-28`,
    url: `/provincia/${provincia}`,
  });

  const timeline = data.monthlyTimeline || [];
  const topBrands = data.topBrandsSummary || [];
  const topModels = data.topModelsSummary || [];

  // Sibling provinces in same community
  const sameCommunity = allProvinces.filter(
    (p) => p.community === data.community && p.slug !== provincia
  );

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
          <span className="text-zinc-500">Provincias</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FF5500] font-bold">{data.name}</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4" />
            <span>Código Provincial INE: {data.code} // {data.community}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matriculaciones en {data.name} // Estadísticas a partir de los microdatos de la DGT
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            La provincia de {data.name} acumula un total de{' '}
            <strong className="text-white font-bold">{data.total.toLocaleString('es-ES')} matriculaciones</strong> registradas en los microdatos de la DGT entre {metadata.startPeriod} y {metadata.endPeriod}. Esto representa el{' '}
            <strong className="text-emerald-400 font-bold">{data.percentageOfSpain}%</strong> del volumen total de vehículos en España.
            {data.population > 0 && (
              <span>
                {' '}Con una población de {data.population.toLocaleString('es-ES')} habitantes ({data.populationSource}), su tasa de matriculación se sitúa en{' '}
                <strong className="text-white font-bold">{data.per1000Habitantes} vehículos por cada 1.000 habitantes</strong>.
              </span>
            )}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Matriculaciones</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {data.total.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-bold">
              {data.percentageOfSpain}% del total nacional
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Tasa Per Cápita (INE 2024)</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              {data.per1000Habitantes}
            </div>
            <div className="text-[11px] text-zinc-400 mt-2">
              Vehículos por cada 1.000 hab.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Coches 100% Eléctricos</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-400 mt-1">
              {data.bevCount.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{data.bevPercentage}%</span> penetración BEV
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Etiqueta 0 CERO (BEV)</span>
            <div className="text-2xl sm:text-3xl font-bold text-sky-300 mt-1">
              {certainCeroCount(data.ceroCount, data.phevCount).toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              <span className="text-white font-bold">{percentageOf(certainCeroCount(data.ceroCount, data.phevCount), data.total)}%</span> de las matriculaciones.{' '}
              {data.phevCount.toLocaleString('es-ES')} {PHEV_BADGE_NOTE}.
            </div>
          </div>
        </div>

        {/* Electrification and Ecological Footprint */}
        <section className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-sky-400" />
            <span>Mix de Electrificación y Etiquetas en {data.name}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1.5">
              <span className="text-xs text-zinc-400 uppercase">Etiqueta 0 CERO (BEV)</span>
              <div className="text-xl font-bold text-sky-400">{certainCeroCount(data.ceroCount, data.phevCount).toLocaleString('es-ES')} veh.</div>
              <p className="text-[11px] text-zinc-500">{percentageOf(certainCeroCount(data.ceroCount, data.phevCount), data.total)}% del total provincial</p>
              <p className="text-[11px] text-zinc-500">{data.phevCount.toLocaleString('es-ES')} {PHEV_BADGE_NOTE}</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1.5">
              <span className="text-xs text-zinc-400 uppercase">Etiqueta ECO (HEV + MHEV + Gas)</span>
              <div className="text-xl font-bold text-emerald-400">{data.ecoCount.toLocaleString('es-ES')} veh.</div>
              <p className="text-[11px] text-zinc-500">{data.ecoPercentage}% del total provincial</p>
            </div>
            <div className="p-4 rounded-lg bg-zinc-900/60 border border-white/5 space-y-1.5">
              <span className="text-xs text-zinc-400 uppercase">Híbridos No Enchufables (HEV)</span>
              <div className="text-xl font-bold text-zinc-200">{data.hevCount.toLocaleString('es-ES')} veh.</div>
              <p className="text-[11px] text-zinc-500">Tecnología de transición predominante</p>
            </div>
          </div>
        </section>

        {/* Top Brands and Models in this Province */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Marcas que Más Veces Lideraron {data.name}</span>
            </h3>
            <div className="divide-y divide-white/5">
              {topBrands.length > 0 ? (
                topBrands.map((b: any, idx: number) => (
                  <div key={b.brand} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-zinc-500 font-bold w-4">#{idx + 1}</span>
                      <Link
                        href={`/marca/${b.slug}`}
                        className="font-bold text-white hover:text-[#FF5500] transition-colors"
                      >
                        {b.brand}
                      </Link>
                    </div>
                    <span className="text-zinc-400 font-bold">{b.timesLeader} meses líder</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-3">Datos consolidados por periodo mensual.</p>
              )}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#FF5500]" />
              <span>Modelos Más Frecuentes en {data.name}</span>
            </h3>
            <div className="divide-y divide-white/5">
              {topModels.length > 0 ? (
                topModels.map((m: any, idx: number) => (
                  <div key={m.model} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-zinc-500 font-bold w-4">#{idx + 1}</span>
                      <span className="font-bold text-white truncate max-w-[200px]">{m.model}</span>
                    </div>
                    <span className="text-zinc-400 font-bold">{m.timesLeader} meses líder</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-3">Datos consolidados por periodo mensual.</p>
              )}
            </div>
          </div>
        </section>

        {/* Monthly Timeline Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF5500]" />
              <span>Evolución Mensual en {data.name}</span>
            </h3>
            <span className="text-xs text-zinc-500">{timeline.length} meses registrados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {timeline.slice(-12).map((m: any) => {
              const [year, month] = m.period.split('-');
              return (
                <Link
                  key={m.period}
                  href={`/matriculaciones/${year}/${month}`}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-[#FF5500]/60 transition-colors group"
                >
                  <span className="text-[11px] text-zinc-400 block group-hover:text-[#FF5500] transition-colors font-bold">
                    {m.period}
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {m.total.toLocaleString('es-ES')} <span className="text-[10px] text-zinc-500">regs</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    {m.topBrand}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Sibling Provinces Navigation */}
        {sameCommunity.length > 0 && (
          <section className="pt-6 border-t border-white/10 space-y-3">
            <h4 className="text-xs text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Otras provincias en {data.community}:</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {sameCommunity.map((p) => (
                <Link
                  key={p.slug}
                  href={`/provincia/${p.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/10 hover:border-emerald-500/50 hover:text-emerald-300 text-zinc-300 transition-colors"
                >
                  {p.name} ({p.total.toLocaleString('es-ES')} regs)
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
