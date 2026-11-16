'use client';

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { TelemetryTooltip } from '@/components/telemetry/TelemetryTooltip';
import { 
  Building2, 
  Globe2, 
  Car, 
  Layers, 
  Zap, 
  Leaf, 
  Gauge, 
  Weight, 
  CheckCircle2, 
  Search,
  Sparkles,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

export function IndustryOriginView() {
  const { automotiveGroups, originCountries, bodyTypes, kpis } = useData();
  const [activeTab, setActiveTab] = useState<'groups' | 'origin' | 'bodies'>('groups');
  const [searchTerm, setSearchTerm] = useState('');

  // Top KPIs
  const topGroup = automotiveGroups[0] || { groupName: 'N/A', percentage: 0, total: 0 };
  const spainOrigin = originCountries.find(c => c.isDomestic) || { percentage: 0, total: 0 };
  const chinaOrigin = originCountries.find(c => c.code === 'CN') || { percentage: 0, total: 0 };
  const suvBody = bodyTypes.find(b => b.code === 'AF') || { percentage: 0, total: 0 };

  // Filter groups
  const filteredGroups = automotiveGroups.filter(g => 
    g.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.brands.some(b => b.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top 4 Telemetry HUD Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Grupo Líder */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Building2 className="w-4 h-4 text-accent" />
            <span>CONSORCIO LÍDER //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white truncate">
            {topGroup.groupName.split(' ')[0]} <span className="text-accent text-sm">{topGroup.percentage}%</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1 truncate">
            {topGroup.total.toLocaleString('es-ES')} regs ({topGroup.topBrand})
          </div>
        </div>

        {/* KPI 2: Made in Spain */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <span className="text-base">🇪🇸</span>
            <span>MADE IN SPAIN (WMI) //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {spainOrigin.percentage}% <span className="text-emerald-400 text-xs font-normal">Nacional</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            Factorías Martorell, Vigo, Zaragoza, Valencia, etc.
          </div>
        </div>

        {/* KPI 3: China Import */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <span className="text-base">🇨🇳</span>
            <span>IMPORTACIÓN CHINA //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {chinaOrigin.percentage}% <span className="text-amber-400 text-xs font-normal">Cuota</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1 truncate">
            SAIC/MG, BYD, Tesla Giga Shanghái, Omoda
          </div>
        </div>

        {/* KPI 4: Cuota SUV */}
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center space-x-2 text-zinc-400 mb-2 font-mono text-xs">
            <Car className="w-4 h-4 text-cyan-400" />
            <span>FORMATO SUV (AF) //</span>
          </div>
          <div className="font-mono text-2xl font-extrabold text-white">
            {suvBody.percentage}% <span className="text-cyan-400 text-xs font-normal">Flota</span>
          </div>
          <div className="text-zinc-500 font-mono text-xs mt-1">
            {suvBody.total.toLocaleString('es-ES')} crossovers matriculados
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
            activeTab === 'groups'
              ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Grupos Automovilísticos (OEMs)</span>
        </button>

        <button
          onClick={() => setActiveTab('origin')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
            activeTab === 'origin'
              ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`}
        >
          <Globe2 className="w-4 h-4" />
          <span>Made in Spain & Origen Global (WMI)</span>
        </button>

        <button
          onClick={() => setActiveTab('bodies')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
            activeTab === 'bodies'
              ? 'bg-accent/15 text-accent border border-accent/40 font-bold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tipología de Carrocería (Efecto SUV)</span>
        </button>
      </div>

      {/* TAB 1: AUTOMOTIVE GROUPS */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          {/* Chart Card */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="pb-3 mb-4 border-b border-zinc-900">
              <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// OEM SHARE // CONGLOMERADOS</span>
              <h3 className="font-sans font-bold text-base text-white">
                Cuota de Mercado por Grupo Automovilístico Matriz
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Consolidación de marcas bajo sus matrices corporativas industriales (VAG, Stellantis, Renault, Toyota, etc.).
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={automotiveGroups.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 110, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
                  <XAxis 
                    type="number" 
                    unit="%" 
                    stroke="#555" 
                    tick={{ fill: '#777', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    dataKey="groupName" 
                    type="category" 
                    stroke="#555" 
                    width={110}
                    tick={{ fill: '#aaa', fontSize: 11, fontFamily: 'monospace' }} 
                  />
                  <Tooltip
                    content={
                      <TelemetryTooltip
                        formatter={(val, name, item) => [
                          `${val}% (${item?.payload?.total?.toLocaleString('es-ES')} regs)`,
                          'Cuota Grupo'
                        ]}
                      />
                    }
                  />
                  <Bar dataKey="percentage" fill="#FF5500" radius={[0, 4, 4, 0]}>
                    {automotiveGroups.slice(0, 10).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? '#FF5500' : index === 1 ? '#F97316' : index === 2 ? '#38BDF8' : '#64748B'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Groups Detailed Table */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-zinc-900">
              <div>
                <h4 className="font-sans font-bold text-sm text-white">
                  Desglose Técnico de Consorcios y Alianzas
                </h4>
                <p className="text-xs text-zinc-400">
                  Volumen, mix de electrificación y promedio de emisiones CO₂ por grupo empresarial.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filtrar por grupo o marca..."
                  className="w-full pl-9 pr-3 py-1.5 bg-black/60 border border-zinc-800 rounded font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">#</th>
                    <th className="pb-3">Grupo Automovilístico</th>
                    <th className="pb-3">Marcas Clave en España</th>
                    <th className="pb-3 text-right">Volumen</th>
                    <th className="pb-3 text-right">Cuota %</th>
                    <th className="pb-3 text-right">Electrificación (0+ECO)</th>
                    <th className="pb-3 text-right pr-2">CO₂ Medio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {filteredGroups.map((g, idx) => (
                    <tr key={g.groupName} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 pl-2 text-zinc-500">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-3 font-bold text-white flex items-center space-x-2">
                        <Building2 className="w-3.5 h-3.5 text-accent" />
                        <span>{g.groupName}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {g.brands.map(b => (
                            <span 
                              key={b} 
                              className={`px-1.5 py-0.5 rounded text-[10px] border ${
                                b === g.topBrand 
                                  ? 'bg-accent/15 border-accent/30 text-accent font-semibold' 
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                              }`}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-right text-zinc-200">{g.total.toLocaleString('es-ES')}</td>
                      <td className="py-3 text-right font-bold text-accent">{g.percentage}%</td>
                      <td className="py-3 text-right">
                        <span className="text-emerald-400">{g.eco0Pct}%</span>
                      </td>
                      <td className="py-3 text-right pr-2 text-zinc-300 font-mono">
                        {g.avgCo2} <span className="text-zinc-500 text-[10px]">g/km</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORIGIN & MADE IN SPAIN */}
      {activeTab === 'origin' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Origin Countries Bar Chart */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="pb-3 mb-4 border-b border-zinc-900">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// GEOPOLÍTICA // WMI</span>
                <h3 className="font-sans font-bold text-base text-white">
                  País de Ensamblaje Industrial (Decodificación WMI)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Identificación de factoría de montaje mediante los primeros 3 caracteres del VIN.
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={originCountries.slice(0, 8)} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis 
                      dataKey="country" 
                      stroke="#555" 
                      tick={{ fill: '#aaa', fontSize: 10, fontFamily: 'monospace' }} 
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis 
                      unit="%" 
                      stroke="#555" 
                      tick={{ fill: '#777', fontSize: 11, fontFamily: 'monospace' }} 
                    />
                    <Tooltip
                      content={
                        <TelemetryTooltip
                          formatter={(val, name, item) => [
                            `${val}% (${item?.payload?.total?.toLocaleString('es-ES')} veh.)`,
                            'Cuota de Fabricación'
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                      {originCountries.slice(0, 8).map((entry, index) => (
                        <Cell 
                          key={`cell-c-${index}`} 
                          fill={entry.isDomestic ? '#10B981' : entry.code === 'CN' ? '#F59E0B' : '#38BDF8'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Made in Spain Fact Sheet */}
            <div className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between">
              <div>
                <div className="pb-3 mb-4 border-b border-zinc-900">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest">// FACTORÍAS NACIONALES</span>
                  <h3 className="font-sans font-bold text-base text-white flex items-center space-x-2">
                    <span>Impacto Industrial "Made in Spain"</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {spainOrigin.percentage}% de la Flota
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    1 de cada 4 vehículos matriculados en España sale de las factorías de ensamblaje nacionales.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                    <span className="text-xl">🏭</span>
                    <div>
                      <div className="text-white font-bold">Martorell (Barcelona) // SEAT S.A.</div>
                      <div className="text-zinc-400 text-[11px]">WMI VSS, VSE • Modelos: Ibiza, Arona, León, Cupra Formentor.</div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                    <span className="text-xl">🏭</span>
                    <div>
                      <div className="text-white font-bold">Vigo & Zaragoza & Villaverde // Stellantis</div>
                      <div className="text-zinc-400 text-[11px]">WMI VR3, VR7, VS6 • Modelos: Peugeot 2008, Opel Corsa, Citroën C4/C3 Aircross.</div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                    <span className="text-xl">🏭</span>
                    <div>
                      <div className="text-white font-bold">Valladolid & Palencia // Renault España</div>
                      <div className="text-zinc-400 text-[11px]">WMI VSR, VNV • Modelos: Captur, Austral, Espace, Rafale.</div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                    <span className="text-xl">🏭</span>
                    <div>
                      <div className="text-white font-bold">Vitoria // Mercedes-Benz España</div>
                      <div className="text-zinc-400 text-[11px]">WMI VSA, VSG • Modelos: Clase V, Vito, eVito.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-900 text-zinc-500 font-mono text-[11px] flex items-center justify-between">
                <span>Codificación estándar ISO 3780 (WMI)</span>
                <span className="text-accent font-bold">{spainOrigin.total.toLocaleString('es-ES')} unidades nacionales</span>
              </div>
            </div>
          </div>

          {/* Table of all origin countries */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="font-sans font-bold text-sm text-white mb-3">
              Ranking Completo de Países Exportadores hacia España
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 pl-2">País</th>
                    <th className="pb-3">Código ISO</th>
                    <th className="pb-3">Tipo de Producción</th>
                    <th className="pb-3">Marcas Principales</th>
                    <th className="pb-3 text-right">Total Registros</th>
                    <th className="pb-3 text-right pr-2">Cuota Flota %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900">
                  {originCountries.map((c) => (
                    <tr key={c.country} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2.5 pl-2 font-bold text-white flex items-center space-x-2">
                        <span>{c.flag}</span>
                        <span>{c.country}</span>
                      </td>
                      <td className="py-2.5 text-zinc-400">{c.code}</td>
                      <td className="py-2.5">
                        {c.isDomestic ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                            Producción Nacional
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800">
                            Importación
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-zinc-300">
                        {c.topBrands.join(', ')}
                      </td>
                      <td className="py-2.5 text-right text-zinc-200">{c.total.toLocaleString('es-ES')}</td>
                      <td className="py-2.5 text-right pr-2 font-bold text-accent">{c.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BODY TYPES */}
      {activeTab === 'bodies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Body Types Chart */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="pb-3 mb-4 border-b border-zinc-900">
                <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// SILUETAS // CARROCERÍA</span>
                <h3 className="font-sans font-bold text-base text-white">
                  Distribución por Tipo de Carrocería Homologada
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Códigos oficiales UE (AF Multiuso/SUV, AB Dos volúmenes, AC Familiar, etc.).
                </p>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bodyTypes} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis 
                      dataKey="code" 
                      stroke="#555" 
                      tick={{ fill: '#aaa', fontSize: 11, fontFamily: 'monospace' }} 
                    />
                    <YAxis 
                      unit="%" 
                      stroke="#555" 
                      tick={{ fill: '#777', fontSize: 11, fontFamily: 'monospace' }} 
                    />
                    <Tooltip
                      content={
                        <TelemetryTooltip
                          formatter={(val, name, item) => [
                            `${val}% (${item?.payload?.total?.toLocaleString('es-ES')} veh.)`,
                            item?.payload?.label || 'Carrocería'
                          ]}
                        />
                      }
                    />
                    <Bar dataKey="percentage" fill="#FF5500" radius={[4, 4, 0, 0]}>
                      {bodyTypes.map((entry, index) => (
                        <Cell 
                          key={`cell-b-${index}`} 
                          fill={entry.code === 'AF' ? '#FF5500' : entry.code === 'AB' ? '#38BDF8' : entry.code === 'AC' ? '#10B981' : '#64748B'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Body Type Engineering Comparison */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="pb-3 mb-4 border-b border-zinc-900">
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">// FÍSICA & DINÁMICA</span>
                <h3 className="font-sans font-bold text-base text-white">
                  Impacto en Potencia y Masa por Carrocería
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Comparativa de tara (peso en vacío) y potencia motriz según el diseño del chasis.
                </p>
              </div>

              <div className="space-y-4">
                {bodyTypes.slice(0, 5).map(b => (
                  <div key={b.code} className="p-3 bg-zinc-900/50 border border-zinc-800 rounded">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-white text-xs flex items-center space-x-2">
                        <span className="px-1.5 py-0.5 bg-black border border-zinc-700 text-accent font-mono rounded text-[10px]">
                          {b.code}
                        </span>
                        <span>{b.label}</span>
                      </div>
                      <span className="font-mono text-accent text-xs font-bold">{b.percentage}% cuota</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-zinc-400 font-mono text-[11px] mt-2">
                      <div className="flex items-center space-x-1.5">
                        <Weight className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Masa Media: <strong className="text-white">{b.avgTara.toLocaleString('es-ES')} kg</strong></span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-400" />
                        <span>Potencia: <strong className="text-white">{b.avgKw} kW ({Math.round(b.avgKw * 1.36)} CV)</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
