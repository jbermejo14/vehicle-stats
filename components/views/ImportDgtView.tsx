'use client';

import React, { useState, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { BadgePill } from '@/components/telemetry/BadgePill';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Sparkles, 
  Cpu, 
  Activity,
  ArrowRight,
  HardDrive,
  Calendar
} from 'lucide-react';

export function ImportDgtView() {
  const { 
    records, 
    sourceName, 
    loadDgtFile, 
    loadPreloaded2026, 
    loadSampleJson, 
    isLoading, 
    parseProgress,
    setActiveView,
    availablePeriods,
    selectedPeriod,
    setSelectedPeriod
  } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setUploadStatus(null);
    const res = await loadDgtFile(file);
    if (res.success) {
      setUploadStatus({
        success: true,
        message: `Fichero ${file.name} procesado con éxito. Se han parseado ${res.count.toLocaleString('es-ES')} registros válidos.`
      });
    } else {
      setUploadStatus({
        success: false,
        message: res.error || 'Error al procesar el archivo.'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="pb-3 border-b border-zinc-900">
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// INGEST // 07</span>
          <h3 className="font-sans font-bold text-base text-white">
            Base de Datos Histórica DGT & Módulo de Ingesta (.TXT)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Decodificador de archivos de ancho fijo MATRABA en codificación ISO-8859-1 y motor SQLite con 34 meses indexados.
          </p>
        </div>

        {/* Current Active Source HUD Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 mt-4 bg-black/60 rounded border border-zinc-800 font-mono text-xs">
          <div className="flex items-center space-x-2.5">
            <Database className="w-4 h-4 text-accent" />
            <span className="text-zinc-400">Origen de datos activo:</span>
            <span className="font-bold text-white">{sourceName}</span>
          </div>
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>34 archivos mensuales (2024-01 ~ 2026-10) integrados</span>
          </div>
        </div>
      </div>

      {/* Database Highlights Banner: 34 months */}
      <div className="bg-gradient-to-r from-[#0C0C12] via-card to-[#0C0C12] border border-accent/40 rounded-lg p-5 shadow-glow">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-accent text-black font-mono font-bold text-[10px] uppercase">
                  BBDD ACTIVA
                </span>
                <h4 className="font-sans font-bold text-base text-white">
                  5.412.845 Matriculaciones Indexadas (2024-01 a 2026-10)
                </h4>
              </div>
              <p className="font-mono text-xs text-zinc-400 mt-1">
                Se han descomprimido, parseado e indexado los 34 ficheros mensuales oficiales de la DGT almacenados en Descargas en una base de datos SQLite integrada.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full lg:w-auto shrink-0 font-mono text-xs">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full lg:w-auto p-2 bg-black border border-zinc-700 hover:border-accent rounded text-white focus:outline-none"
            >
              {availablePeriods.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#111115] text-white">
                  {p.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => setActiveView('overview')}
              className="px-3.5 py-2 bg-accent hover:bg-accent-hover text-black font-bold rounded flex items-center space-x-1 shrink-0"
            >
              <span>Ver</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Upload Zone for new external files */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-accent bg-accent/10 shadow-[0_0_30px_rgba(255,85,0,0.3)]'
            : 'border-zinc-800 hover:border-accent/60 bg-card/60 hover:bg-card'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.zip,.csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-accent/10 border border-accent/40 flex items-center justify-center text-accent shadow-glow">
            <UploadCloud className="w-7 h-7" />
          </div>

          <div>
            <h4 className="font-sans font-bold text-base text-white mb-0.5">
              Arrastra un fichero microdatos DGT adicional (.txt o .zip)
            </h4>
            <p className="font-mono text-xs text-zinc-400 max-w-md mx-auto">
              Para analizar un fichero diario o mensual nuevo directamente en memoria sin persistir.
            </p>
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 hover:border-accent font-mono text-xs font-bold uppercase rounded transition-all"
          >
            Examinar archivo .TXT
          </button>
        </div>

        {/* Parsing Progress Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center p-6 z-20">
            <RefreshCw className="w-10 h-10 text-accent animate-spin mb-4" />
            <h4 className="font-sans font-bold text-white text-base mb-1">
              Consultando BBDD DGT...
            </h4>
            <span className="font-mono text-xs text-zinc-400">
              Cargando estadísticas agregadas y muestra de registros
            </span>
          </div>
        )}
      </div>

      {/* Upload Status Banner */}
      {uploadStatus && (
        <div
          className={`p-4 rounded-lg border font-mono text-xs flex items-center justify-between ${
            uploadStatus.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {uploadStatus.success ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{uploadStatus.message}</span>
          </div>

          {uploadStatus.success && (
            <button
              onClick={() => setActiveView('overview')}
              className="flex items-center space-x-1 px-3 py-1 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition-colors shrink-0 ml-4"
            >
              <span>Ver Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Raw Parser Preview Table (Sample records) */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-900">
          <div>
            <span className="font-mono text-[10px] text-accent uppercase tracking-widest">// PREVIEW // 07</span>
            <h3 className="font-sans font-bold text-base text-white">
              Previsualización de Registros de la BBDD
            </h3>
          </div>
          <span className="font-mono text-xs text-zinc-500">
            Mostrando 10 registros del periodo actual
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px] tracking-wider">
                <th className="pb-2.5 pl-2">Fecha</th>
                <th className="pb-2.5">Trámite</th>
                <th className="pb-2.5">Marca / Modelo</th>
                <th className="pb-2.5">Bastidor (WMI)</th>
                <th className="pb-2.5">Municipio / Provincia</th>
                <th className="pb-2.5 text-right">kW</th>
                <th className="pb-2.5 text-right">CO₂</th>
                <th className="pb-2.5 text-center pr-2">Etiqueta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {records.slice(0, 10).map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-2.5 pl-2 text-zinc-400">{r.fecMatricula}</td>
                  <td className="py-2.5">
                    <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 text-[10px]">
                      {r.tipoTramite}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <span className="font-bold text-white">{r.marca}</span>
                    <span className="text-zinc-400 ml-1">{r.modelo}</span>
                  </td>
                  <td className="py-2.5 text-zinc-400 text-[11px]">{r.vinParcial}</td>
                  <td className="py-2.5 text-zinc-300">
                    {r.municipio} ({r.provinciaNombre})
                  </td>
                  <td className="py-2.5 text-right font-bold text-white">{r.potenciaKw}</td>
                  <td className="py-2.5 text-right font-bold text-accent">{r.emisionesCo2}</td>
                  <td className="py-2.5 text-center pr-2">
                    <BadgePill badge={r.etiquetaDgt} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
