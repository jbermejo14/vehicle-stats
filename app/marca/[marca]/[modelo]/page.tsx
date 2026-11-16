import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import { getModelData, getAllModelFiles, getMetadata } from '@/lib/staticData';
import { constructMetadata, generateBreadcrumbJsonLd, generateDatasetJsonLd } from '@/lib/seo';
import { 
  Car, 
  Fuel, 
  Zap, 
  Gauge, 
  Scale, 
  Calendar, 
  ChevronRight,
  TrendingUp,
  Tag
} from 'lucide-react';

export const dynamicParams = false;

interface PageProps {
  params: Promise<{
    marca: string;
    modelo: string;
  }>;
}

export async function generateStaticParams() {
  const modelFiles = getAllModelFiles();
  return modelFiles.map((m) => ({
    marca: m.brandSlug,
    modelo: m.modelSlug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { marca, modelo } = await params;
  const data = getModelData(marca, modelo);
  if (!data) return {};

  const totalStr = data.total.toLocaleString('es-ES');

  return constructMetadata({
    title: `${data.fullName} en España // ${totalStr} Matriculaciones DGT`,
    description: `Ficha técnica oficial de matriculaciones del ${data.fullName} en España. Total de ${totalStr} unidades registradas en la DGT, categoría ${data.category}, propulsión ${data.primaryFuel}, distintivo ambiental ${data.primaryBadge} y ${data.avgCv} CV medios.`,
    canonicalPath: `/marca/${marca}/${modelo}`,
  });
}

export default async function ModelPage({ params }: PageProps) {
  const { marca, modelo } = await params;
  const data = getModelData(marca, modelo);
  if (!data) notFound();

  const metadata = getMetadata();
  const evolution = data.evolution || [];

  const breadcrumbs = [
    { name: 'Inicio', item: '/' },
    { name: 'Marcas', item: '/marca/toyota' },
    { name: data.brand, item: `/marca/${marca}` },
    { name: data.model, item: `/marca/${marca}/${modelo}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbs);
  const datasetJsonLd = generateDatasetJsonLd({
    name: `Microdatos DGT Matriculaciones de ${data.fullName}`,
    description: `Datos oficiales de matriculación del vehículo ${data.fullName} en España. ${data.total.toLocaleString('es-ES')} unidades.`,
    temporalCoverage: `${metadata.startPeriod}-01/${metadata.endPeriod}-28`,
    url: `/marca/${marca}/${modelo}`,
  });

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
          <Link href={`/marca/${marca}`} className="hover:text-white transition-colors">{data.brand}</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[#FF5500] font-bold">{data.model}</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs text-[#FF5500] font-bold uppercase tracking-wider mb-2">
            <Car className="w-4 h-4" />
            <span>Ficha Técnica Homologada // Registro DGT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matriculaciones de {data.fullName} en España
          </h1>
          <p className="text-sm text-zinc-400 mt-2 max-w-3xl leading-relaxed">
            El modelo <strong className="text-white font-bold">{data.fullName}</strong> registra un total de{' '}
            <strong className="text-white font-bold">{data.total.toLocaleString('es-ES')} matriculaciones oficiales</strong> en España entre {metadata.startPeriod} y {metadata.endPeriod}.
            Clasificado oficialmente como <strong className="text-zinc-200">{data.category}</strong>, su motorización predominante es <strong className="text-zinc-200">{data.primaryFuel}</strong> con distintivo ambiental DGT <strong className="text-emerald-400">{data.primaryBadge}</strong>.
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Total Matriculaciones</span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
              {data.total.toLocaleString('es-ES')}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Unidades en España
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Combustible Principal</span>
            <div className="text-xl sm:text-2xl font-bold text-sky-400 mt-1 truncate">
              {data.primaryFuel}
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Etiqueta DGT: <strong className="text-emerald-400">{data.primaryBadge}</strong>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Potencia Homologada</span>
            <div className="text-2xl sm:text-3xl font-bold text-zinc-200 mt-1">
              {data.avgCv} <span className="text-sm font-normal text-zinc-500">CV</span>
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              {data.avgKw} kW de media
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
            <span className="text-xs text-zinc-500 uppercase tracking-wider">Emisiones Medias CO₂</span>
            <div className="text-2xl sm:text-3xl font-bold text-[#FF5500] mt-1">
              {data.avgCo2} <span className="text-sm font-normal text-zinc-500">g/km</span>
            </div>
            <div className="text-xs text-zinc-400 mt-2">
              Ciclo oficial WLTP
            </div>
          </div>
        </div>

        {/* Monthly Registration Evolution */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#FF5500]" />
              <span>Evolución Mensual del {data.fullName}</span>
            </h2>
            <span className="text-xs text-zinc-500">{evolution.length} meses auditados</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {evolution.slice(-12).map((m: any) => {
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
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {m.avgCv} CV // {m.avgCo2}g
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Back navigation & links */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <Link
            href={`/marca/${marca}`}
            className="text-[#FF5500] hover:underline flex items-center gap-1 font-bold"
          >
            <span>← Ver todos los modelos de {data.brand}</span>
          </Link>

          <Link
            href="/electricos"
            className="text-sky-400 hover:underline flex items-center gap-1"
          >
            <span>Ver ranking general de eléctricos e híbridos →</span>
          </Link>
        </div>
      </div>
    </>
  );
}
