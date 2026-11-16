import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getBrandData, getBrandsIndex, getMetadata } from '@/lib/staticData';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  Tag, 
  Trophy, 
  Gauge, 
  Zap, 
  Calendar, 
  MapPin, 
  ChevronRight,
  ArrowRight,
  Activity
} from 'lucide-react';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    marca: string;
  }>;
}

export async function generateStaticParams() {
  const brands = getBrandsIndex();
  return brands.map((b) => ({
    marca: b.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marca } = await params;
  const data = getBrandData(marca);
  if (!data) return {};

  const totalStr = data.total.toLocaleString('es-ES');

  return constructMetadata({
    title: `Matriculaciones de ${data.brand} en España // ${totalStr} Vehículos DGT`,
    description: `Estadísticas oficiales DGT de ${data.brand} en España. Total de ${totalStr} matriculaciones (${data.percentage}% de cuota de mercado), modelos más vendidos, penetración de versiones ECO y eléctricas y evolución mensual.`,
    canonicalPath: `/marca/${marca}`,
  });
}

export default async function BrandPage({ params }: PageProps) {
  const { marca } = await params;
  const data = getBrandData(marca);
  if (!data) notFound();

  const metadata = getMetadata();
  const allBrands = getBrandsIndex();

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: 'Marcas', item: '/marca/toyota' },
    { name: data.brand, item: `/marca/${marca}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: `Microdatos DGT Matriculaciones de ${data.brand} en España`,
    description: `Registro oficial de vehículos de la marca ${data.brand} matriculados en España. ${data.total.toLocaleString('es-ES')} unidades procesadas.`,
    temporalCoverage: `${metadata.startPeriod}-01/${metadata.endPeriod}-28`,
    url: `/marca/${marca}`,
  });

  const models = data.models || [];
  const monthly = data.monthlyEvolution || [];
  const leadProvinces = data.leadProvinces || [];

  const avgCv = Math.round((data.avgKw || 100) * 1.35962);

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
          <span className="text-zinc-500">Marcas</span>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FF5500] font-bold">{data.brand}</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
            <Tag className="w-4 h-4" />
            <span>Fabricante Oficial // Censo DGT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matriculaciones de {data.brand} en España // Estadísticas DGT
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            La marca <strong className="text-white font-bold">{data.brand}</strong> acumula un volumen de{' '}
            <strong className="text-white font-bold">{data.total.toLocaleString('es-ES')} vehículos matriculados</strong> en España entre {metadata.startPeriod} y {metadata.endPeriod}, representando una cuota del{' '}
            <strong className="text-amber-400 font-bold">{data.percentage}%</strong> sobre el total nacional.
            El {data.eco0Percentage}% de su flota registrada cuenta con distintivo ambiental ECO o Cero Emisiones de la DGT, con una potencia media de {data.avgKw} kW ({avgCv} CV).
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Matriculaciones</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {data.total.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-amber-400 mt-2 font-bold">
              {data.percentage}% de cuota de mercado
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Cuota ECO / Cero Emisiones</span>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-1">
              {data.eco0Percentage}%
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Flota con etiqueta ECO o 0 CERO
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Potencia Media</span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-200 mt-1">
              {avgCv} <span className="text-sm font-normal text-zinc-500">CV</span>
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              {data.avgKw} kW homologados
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Gama de Modelos Registrada</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#FF5500] mt-1">
              {models.length}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Modelos con ≥50 matriculaciones
            </div>
          </div>
        </div>

        {/* Models Table / Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Modelos Más Vendidos de {data.brand} en España</span>
            </h2>
            <span className="text-xs text-zinc-500">{models.length} modelos auditados</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {models.map((m: any, idx: number) => (
              <Link
                key={m.modelSlug}
                href={`/marca/${m.brandSlug}/${m.modelSlug}`}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-[#FF5500]/60 hover:bg-[#FF5500]/5 transition-all group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 font-bold">#{idx + 1}</span>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#FF5500] transition-colors" />
                </div>
                <div className="text-base font-bold text-white group-hover:text-[#FF5500] transition-colors">
                  {m.model}
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-white/5">
                  <span>{m.total.toLocaleString('es-ES')} unidades</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                    {m.primaryFuel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Monthly Timeline Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF5500]" />
              <span>Evolución Mensual de {data.brand}</span>
            </h3>
            <span className="text-xs text-zinc-500">{monthly.length} meses registrados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {monthly.slice(-12).map((m: any) => {
              const [year, month] = m.period.split('-');
              return (
                <Link
                  key={m.period}
                  href={`/matriculaciones/${year}/${month}`}
                  className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-amber-400/60 transition-colors group"
                >
                  <span className="text-[11px] text-zinc-400 block group-hover:text-amber-400 transition-colors font-bold">
                    {m.period}
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {m.total.toLocaleString('es-ES')} <span className="text-[10px] text-zinc-500">regs</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5 truncate">
                    Top: {m.topModel}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Lead Provinces */}
        {leadProvinces.length > 0 && (
          <section className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Provincias donde {data.brand} fue Marca Número 1</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {leadProvinces.map((lp: any) => (
                <Link
                  key={lp.slug}
                  href={`/provincia/${lp.slug}`}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/10 hover:border-emerald-400 text-zinc-300 hover:text-white transition-colors"
                >
                  {lp.province} ({lp.monthsLeading} meses líder)
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Other Brands Navigation */}
        <section className="pt-6 border-t border-white/10 space-y-3">
          <h4 className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            Otras Marcas en el Mercado Español:
          </h4>
          <div className="flex flex-wrap gap-2 text-xs">
            {allBrands.slice(0, 15).map((b) => (
              <Link
                key={b.slug}
                href={`/marca/${b.slug}`}
                className={`px-3 py-1.5 rounded-lg border transition-colors ${
                  b.slug === marca
                    ? 'bg-[#FF5500] text-black border-[#FF5500] font-bold'
                    : 'bg-white/[0.02] border-white/10 text-zinc-300 hover:border-white/30'
                }`}
              >
                {b.brand}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
