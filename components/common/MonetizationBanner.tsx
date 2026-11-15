'use client';

import React, { useState } from 'react';
import { ShieldCheck, ExternalLink, Zap, Calculator, FileText, X } from 'lucide-react';

export function TechnicalPartnerBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="relative w-full bg-gradient-to-r from-zinc-950 via-[#111115] to-zinc-950 border border-zinc-800/80 hover:border-accent/40 rounded-lg p-3 transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-accent/20 text-accent font-bold tracking-widest">
                PATROCINADOR TÉCNICO
              </span>
              <span className="text-xs font-semibold text-white tracking-wide">
                Telemetría Certificada para Flotas & Concesionarios
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Acceso a APIs en tiempo real de matriculaciones DGT, histórico de números de bastidor e informes de valor residual.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <a
            href="#partner-info"
            onClick={(e) => {
              e.preventDefault();
              alert('DGT PULSE // Programa de Patrocinio Técnico y Conectividad API para flotas corporativas.');
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-accent hover:text-black text-zinc-200 border border-zinc-700 hover:border-accent font-mono text-xs rounded transition-all duration-200"
          >
            <span>Conectar API</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setVisible(false)}
            className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
            title="Cerrar banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

interface ModelActionButtonsProps {
  modelFullName: string;
  brand: string;
}

export function ModelActionButtons({ modelFullName, brand }: ModelActionButtonsProps) {
  const [modalType, setModalType] = useState<'ficha' | 'seguro' | null>(null);

  return (
    <>
      <div className="flex items-center space-x-1.5">
        <button
          onClick={() => setModalType('ficha')}
          title="Ver ficha técnica detallada homologada"
          className="flex items-center space-x-1 px-2 py-1 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-accent border border-zinc-800 hover:border-accent/40 rounded font-mono text-[10px] transition-all"
        >
          <FileText className="w-3 h-3 text-accent" />
          <span>Ficha</span>
        </button>
        <button
          onClick={() => setModalType('seguro')}
          title="Calcular cotización de seguro a todo riesgo"
          className="flex items-center space-x-1 px-2 py-1 bg-accent/10 hover:bg-accent text-accent hover:text-black border border-accent/30 hover:border-accent rounded font-mono text-[10px] font-bold transition-all"
        >
          <Calculator className="w-3 h-3" />
          <span>Seguro</span>
        </button>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111115] border border-accent/60 rounded-lg p-6 max-w-md w-full shadow-[0_0_30px_rgba(255,85,0,0.3)] font-mono text-zinc-300 relative">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {modalType === 'ficha' ? (
              <div>
                <div className="flex items-center space-x-2 text-accent mb-3">
                  <FileText className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wider uppercase">Ficha Técnica Homologada</span>
                </div>
                <h4 className="text-white font-bold text-base mb-2">{brand} {modelFullName}</h4>
                <div className="space-y-2 text-xs bg-black/40 p-3 rounded border border-zinc-800 my-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Normativa de emisiones:</span>
                    <span className="text-white">Euro 6e-bis (WLTP)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Categoría Homologación:</span>
                    <span className="text-white">M1 / M1G Turismo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Garantía Oficial Fabricante:</span>
                    <span className="text-accent">5 - 7 Años / 150.000 km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Exención IEDMT:</span>
                    <span className="text-emerald-400">Verificada DGT 0% / 4,75%</span>
                  </div>
                </div>
                <button
                  onClick={() => setModalType(null)}
                  className="w-full py-2 bg-accent hover:bg-accent-hover text-black font-bold text-xs uppercase rounded transition-colors"
                >
                  Cerrar Ficha
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-2 text-accent mb-3">
                  <Calculator className="w-5 h-5" />
                  <span className="font-bold text-sm tracking-wider uppercase">Cotizador de Seguros de Flota</span>
                </div>
                <h4 className="text-white font-bold text-base mb-1">{brand} {modelFullName}</h4>
                <p className="text-[11px] text-zinc-400 mb-4">
                  Tarificación automática para flotas comerciales y particulares con cobertura de batería y carga eléctrica.
                </p>
                <div className="space-y-2 text-xs bg-black/40 p-3 rounded border border-zinc-800 my-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Terceros Ampliado con Robo:</span>
                    <span className="text-white font-bold">desde 249 €/año</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Todo Riesgo con Franquicia 150€:</span>
                    <span className="text-accent font-bold">desde 489 €/año</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Todo Riesgo Flota Sin Franquicia:</span>
                    <span className="text-emerald-400 font-bold">desde 720 €/año</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert('Redirigiendo a pasarela de cotización de póliza...');
                    setModalType(null);
                  }}
                  className="w-full py-2 bg-accent hover:bg-accent-hover text-black font-bold text-xs uppercase rounded transition-colors"
                >
                  Solicitar Oferta Personalizada
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
