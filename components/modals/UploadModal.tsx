'use client';

import React, { useRef, useState } from 'react';
import { useData } from '@/context/DataContext';
import { UploadCloud, X, Database, Sparkles, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export function UploadModal() {
  const { 
    isUploadModalOpen, 
    setIsUploadModalOpen, 
    loadDgtFile, 
    loadSampleJson, 
    loadPreloaded2026, 
    isLoading, 
    parseProgress 
  } = useData();

  const [dragActive, setDragActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ success: boolean; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isUploadModalOpen) return null;

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setStatusMsg(null);
    const res = await loadDgtFile(file);
    if (res.success) {
      setStatusMsg({
        success: true,
        text: `Fichero ${file.name} cargado con éxito (${res.count.toLocaleString('es-ES')} registros).`
      });
      setTimeout(() => {
        setIsUploadModalOpen(false);
      }, 1200);
    } else {
      setStatusMsg({
        success: false,
        text: res.error || 'Error al procesar el archivo.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#111115] border border-accent/60 rounded-xl p-6 max-w-lg w-full shadow-[0_0_40px_rgba(255,85,0,0.3)] font-mono text-zinc-300 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsUploadModalOpen(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <span className="font-mono text-[10px] text-accent uppercase tracking-widest block">
            // INGESTION HUD
          </span>
          <h3 className="font-sans font-bold text-lg text-white">
            Cargar Microdatos DGT (.TXT)
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Decodificación en cliente de ficheros MATRABA de ancho fijo en formato ISO-8859-1.
          </p>
        </div>

        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-accent bg-accent/10'
              : 'border-zinc-800 hover:border-accent/60 bg-black/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.zip,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <UploadCloud className="w-10 h-10 text-accent mx-auto mb-2" />
          <div className="font-bold text-white text-sm">Arrastra aquí el archivo o haz clic</div>
          <div className="text-[11px] text-zinc-500 mt-1">
            Fichero oficial de la DGT (.txt)
          </div>
        </div>

        {/* Loading Progress */}
        {isLoading && (
          <div className="my-4 p-3 bg-black/60 rounded border border-zinc-800 text-center">
            <RefreshCw className="w-6 h-6 text-accent animate-spin mx-auto mb-2" />
            <div className="text-xs text-white">Decodificando archivo ({parseProgress}%)...</div>
          </div>
        )}

        {/* Status message */}
        {statusMsg && (
          <div
            className={`mt-4 p-3 rounded border text-xs flex items-center space-x-2 ${
              statusMsg.success
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
            }`}
          >
            {statusMsg.success ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Quick presets */}
        <div className="mt-5 pt-4 border-t border-zinc-900 space-y-2">
          <div className="text-[10px] uppercase text-zinc-500 tracking-wider">
            O selecciona un conjunto precargado:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={async () => {
                await loadSampleJson();
                setIsUploadModalOpen(false);
              }}
              className="p-2.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-accent text-left text-xs text-white font-mono transition-colors flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-accent shrink-0" />
              <div>
                <div className="font-bold">Oficial 2026</div>
                <div className="text-[10px] text-zinc-500">3.000 regs DGT</div>
              </div>
            </button>

            <button
              onClick={() => {
                loadPreloaded2026();
                setIsUploadModalOpen(false);
              }}
              className="p-2.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-400 text-left text-xs text-white font-mono transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="font-bold">Simulación 2026</div>
                <div className="text-[10px] text-zinc-500">3.000 sintéticos</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
