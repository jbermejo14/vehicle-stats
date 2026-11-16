'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { 
  DgtRecord, 
  FilterState, 
  GlobalKpis, 
  ProvinceStat, 
  BrandStat, 
  ModelStat, 
  TimelineDataPoint,
  PowerBracketStat,
  DisplacementBracketStat,
  Co2BracketStat,
  AutomotiveGroupStat,
  OriginCountryStat,
  BodyTypeStat,
  WeightPowerBracket,
  MunicipalityStat,
  FuelStat,
  BadgeStat,
  FuelBadgeCrossMatrix
} from '../lib/dgtTypes';
import { parseDgtContent, decodeDgtBuffer } from '../lib/dgtParser';
import { filterRecords } from '../lib/analyticsEngine';

export type ViewKey = 
  | 'overview' 
  | 'provinces' 
  | 'fuels' 
  | 'brands' 
  | 'industry'
  | 'engineering' 
  | 'emissions';

export type TramiteTipo = 'todas' | 'nuevas' | 'transferencias' | 'bajas';

export interface PeriodOption {
  id: string;
  label: string;
  totalRegs: number;
  isYear?: boolean;
  isAll?: boolean;
}

interface DataContextType {
  records: DgtRecord[];
  filteredRecords: DgtRecord[];
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  isLoading: boolean;
  parseProgress: number;
  sourceName: string;
  loadDgtFile: (file: File) => Promise<{ success: boolean; count: number; error?: string }>;
  compareModels: [string, string];
  setCompareModels: (models: [string, string]) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  availablePeriods: PeriodOption[];
  kpis: GlobalKpis;
  timeline: TimelineDataPoint[];
  provinceStats: ProvinceStat[];
  brandStats: BrandStat[];
  modelStats: ModelStat[];
  powerBrackets: PowerBracketStat[];
  displacementBrackets: DisplacementBracketStat[];
  co2Histogram: { range: string; count: number; percentage: number }[];
  iedmtBrackets: Co2BracketStat[];
  euroStandards: { norm: string; count: number; percentage: number }[];
  automotiveGroups: AutomotiveGroupStat[];
  originCountries: OriginCountryStat[];
  bodyTypes: BodyTypeStat[];
  weightPowerBrackets: WeightPowerBracket[];
  municipalityStats: MunicipalityStat[];
  fuelStats: FuelStat[];
  badgeStats: BadgeStat[];
  fuelBadgeMatrix: FuelBadgeCrossMatrix | null;
  dbData: any;
}

const defaultFilters: FilterState = {
  tramite: 'todas',
  categoria: 'todos',
  propulsion: 'todas',
  etiqueta: 'todas',
  provincia: 'todas',
  search: '',
  startDate: '',
  endDate: '',
};

const emptyKpis: GlobalKpis = {
  totalRegistrations: 0,
  nuevasCount: 0,
  transferenciasCount: 0,
  electrificadosCount: 0,
  electrificadosPct: 0,
  ceroCount: 0,
  ceroPct: 0,
  ecoCount: 0,
  ecoPct: 0,
  bevCount: 0,
  phevCount: 0,
  hevCount: 0,
  avgCo2: 0,
  co2ExemptPct: 0,
  avgKw: 0,
  avgCv: 0,
  avgTara: 0,
  topBrand: { name: 'N/A', count: 0, pct: 0 },
  topModel: { name: 'N/A', brand: 'N/A', count: 0, pct: 0 },
  topProvince: { name: 'N/A', count: 0, pct: 0 },
  topEuroNorm: { norm: 'N/A', pct: 0 }
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<DgtRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [parseProgress, setParseProgress] = useState<number>(0);
  const [sourceName, setSourceName] = useState<string>('Cargando microdatos oficiales DGT...');
  const [compareModels, setCompareModels] = useState<[string, string]>(['SEAT IBIZA', 'TOYOTA COROLLA']);
  const [selectedPeriod, setSelectedPeriodState] = useState<string>('all');
  const [availablePeriods, setAvailablePeriods] = useState<PeriodOption[]>([]);
  
  const [dbData, setDbData] = useState<{
    kpis: GlobalKpis;
    timeline: TimelineDataPoint[];
    provinceStats: ProvinceStat[];
    brandStats: BrandStat[];
    modelStats: ModelStat[];
    powerBrackets: PowerBracketStat[];
    displacementBrackets: DisplacementBracketStat[];
    co2Histogram: { range: string; count: number; percentage: number }[];
    iedmtBrackets: Co2BracketStat[];
    euroStandards: { norm: string; count: number; percentage: number }[];
    automotiveGroups: AutomotiveGroupStat[];
    originCountries: OriginCountryStat[];
    bodyTypes: BodyTypeStat[];
    weightPowerBrackets: WeightPowerBracket[];
    municipalityStats: MunicipalityStat[];
    fuelStats: FuelStat[];
    badgeStats: BadgeStat[];
    fuelBadgeMatrix: FuelBadgeCrossMatrix | null;
  } | null>(null);

  // Fetch Available Periods from static aggregated API on Mount
  useEffect(() => {
    async function initPeriodsAndData() {
      try {
        const pRes = await fetch('/api/periods');
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.periods) && pData.periods.length > 0) {
            setAvailablePeriods(pData.periods);
            await loadPeriodFromDb('all');
            return;
          }
        }
      } catch (err) {
        console.error('Error al conectar con /api/periods:', err);
      }
      setIsLoading(false);
      setSourceName('Microdatos oficiales DGT (5,4M registros)');
    }

    initPeriodsAndData();
  }, []);

  const loadPeriodFromDb = async (periodId: string, tramite: TramiteTipo = 'todas') => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dgt-data?period=${periodId}&tramite=${tramite}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          setDbData({
            kpis: d.kpis || emptyKpis,
            timeline: d.timeline || [],
            provinceStats: d.provinceStats || [],
            brandStats: d.brandStats || [],
            modelStats: d.modelStats || [],
            powerBrackets: d.powerBrackets || [],
            displacementBrackets: d.displacementBrackets || [],
            co2Histogram: d.co2Histogram || [],
            iedmtBrackets: d.iedmtBrackets || [],
            euroStandards: d.euroStandards || [],
            automotiveGroups: d.automotiveGroups || [],
            originCountries: d.originCountries || [],
            bodyTypes: d.bodyTypes || [],
            weightPowerBrackets: d.weightPowerBrackets || [],
            municipalityStats: d.municipalityStats || [],
            fuelStats: d.fuelStats || [],
            badgeStats: d.badgeStats || [],
            fuelBadgeMatrix: d.fuelBadgeMatrix || null
          });
          setRecords(d.records || []);
          setSourceName(`DGT // ${d.periodLabel} (${d.totalRegistrations.toLocaleString('es-ES')} regs)`);
          
          if (d.modelStats && d.modelStats.length >= 2) {
            setCompareModels([d.modelStats[0].fullName, d.modelStats[1].fullName]);
          }
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.error('Error cargando datos de periodo:', err);
    }
    setIsLoading(false);
  };

  const setSelectedPeriod = (periodId: string) => {
    setSelectedPeriodState(periodId);
    loadPeriodFromDb(periodId, filters.tramite);
  };

  const setFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'tramite') {
        loadPeriodFromDb(selectedPeriod, value as TramiteTipo);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    loadPeriodFromDb(selectedPeriod, 'todas');
  };

  const loadDgtFile = async (file: File): Promise<{ success: boolean; count: number; error?: string }> => {
    setIsLoading(true);
    setParseProgress(5);
    try {
      const buffer = await file.arrayBuffer();
      setParseProgress(30);
      const text = decodeDgtBuffer(buffer);
      setParseProgress(50);
      
      const parseResult = parseDgtContent(text, 15000, (prog) => {
        setParseProgress(50 + Math.round(prog * 0.45));
      });
      
      setRecords(parseResult.records);
      setDbData(null);
      setSourceName(`Microdatos DGT: ${file.name} (${parseResult.parsedCount.toLocaleString('es-ES')} regs)`);
      setParseProgress(100);
      setIsLoading(false);

      return {
        success: true,
        count: parseResult.parsedCount
      };
    } catch (err: any) {
      setIsLoading(false);
      return {
        success: false,
        count: 0,
        error: err?.message || 'Error al procesar microdatos DGT'
      };
    }
  };

  const filteredRecords = useMemo(() => {
    return filterRecords(records, filters);
  }, [records, filters]);

  return (
    <DataContext.Provider
      value={{
        records,
        filteredRecords,
        filters,
        setFilter,
        resetFilters,
        activeView,
        setActiveView,
        isLoading,
        parseProgress,
        sourceName,
        loadDgtFile,
        compareModels,
        setCompareModels,
        selectedPeriod,
        setSelectedPeriod,
        availablePeriods,
        kpis: dbData?.kpis || emptyKpis,
        timeline: dbData?.timeline || [],
        provinceStats: dbData?.provinceStats || [],
        brandStats: dbData?.brandStats || [],
        modelStats: dbData?.modelStats || [],
        powerBrackets: dbData?.powerBrackets || [],
        displacementBrackets: dbData?.displacementBrackets || [],
        co2Histogram: dbData?.co2Histogram || [],
        iedmtBrackets: dbData?.iedmtBrackets || [],
        euroStandards: dbData?.euroStandards || [],
        automotiveGroups: dbData?.automotiveGroups || [],
        originCountries: dbData?.originCountries || [],
        bodyTypes: dbData?.bodyTypes || [],
        weightPowerBrackets: dbData?.weightPowerBrackets || [],
        municipalityStats: dbData?.municipalityStats || [],
        fuelStats: dbData?.fuelStats || [],
        badgeStats: dbData?.badgeStats || [],
        fuelBadgeMatrix: dbData?.fuelBadgeMatrix || null,
        dbData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
