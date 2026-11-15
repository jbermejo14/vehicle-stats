# DGT Pulse // Telemetry & Fleet Analytics 🚗⚡📊

> Plataforma avanzada de telemetría automotriz y analítica de datos masivos para la visualización de estadísticas históricas y en tiempo real de vehículos matriculados en España a partir de los microdatos oficiales de la **Dirección General de Tráfico (DGT)** (`MATRABA`).

![DGT Pulse Banner](https://img.shields.io/badge/DGT_PULSE-v2.4.0--PRO-FF5500?style=for-the-badge&logo=speedtest&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite_3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## ⚡ Características Principales

- **Base de Datos Histórica Multi-Anual:** Indexa más de **5.400.000 de matriculaciones oficiales** procedentes de 34 meses de microdatos DGT (desde `2024-01` hasta `2026-10`).
- **Consultas Sub-150ms:** Motor SQLite embebido de alto rendimiento que permite agregar y filtrar millones de registros en milisegundos.
- **Identidad Visual Cyber-Automotive (HUD):**
  - Paleta estricta de alto contraste: Fondo negro carbón (`#050505` / `#0A0A0C`) con acentos en Naranja Eléctrico (`#FF5500`) y efectos de resplandor (*glow*).
  - Tipografía geométrica para títulos y tipografía monoespaciada (`JetBrains Mono`) para KPIs, potencias, emisiones y tablas técnicas.
- **Parser de Ancho Fijo DGT (`/lib/dgtParser.ts`):** Decodificador nativo para archivos `MATRABA` de 714 caracteres en codificación `ISO-8859-1` (Latin-1) y `UTF-8`.
- **Deducción Automática de Distintivos Ambientales:** Clasificación precisa de etiquetas DGT (**0 CERO**, **ECO**, **C**, **B**, **Sin Etiqueta**) cruzando tracción, hibridación (`HEV`, `PHEV`, `BEV`, `MHEV`, `GLP`) y normas anticontaminación Euro.
- **Herramienta Drag & Drop de Ingesta:** Carga de ficheros `.txt` descargados directamente del portal de la DGT para recalcular todo el dashboard dinámicamente en memoria.

---

## 🧭 Las 7 Vistas de la Consola de Telemetría

1. **Command Center (Visión General):** KPIs globales animados (Total matriculados, % Electrificación, Media CO₂ flota, Potencia media en kW/CV, Marca líder y Modelo top), serie temporal evolutiva y feed en vivo.
2. **Mapa & Ranking por Provincias:** Mapa coroplético interactivo en escala térmica negro-naranja con recuadro inset para Canarias, Ceuta y Melilla, y conmutador entre volumen absoluto y tasa por cada 1.000 habitantes (censo INE).
3. **Combustibles & Distintivos DGT:** Gráficos donut y barras del mix energético (Gasolina, Diésel, HEV, PHEV, BEV, GLP/GNC) y matriz cruzada propulsión vs distintivo ambiental.
4. **Ranking de Marcas & Modelos:** Top 20 marcas y Top 25 modelos con buscador instantáneo, filtros por categoría (Turismos M1, Motos L3e, Comerciales N1) y **Comparador 1 vs 1** frente a frente.
5. **Ingeniería, Potencia & Masa:** Tramos de potencia motriz (kW y CV), cilindrada (cc) y diagrama de dispersión cinemático (*Scatter Plot*) de Tara homologada vs Potencia neta.
6. **Emisiones CO₂ & Tramos IEDMT:** Histograma de emisiones WLTP, distribución fiscal del Impuesto de Matriculación español (exención $\le$120 g/km vs tramos 4,75%, 9,75% y 14,75%) y cumplimiento de normas Euro (Euro 6e-bis, Euro 6e, Euro 6d, Euro 5+).
7. **Importar DGT (.TXT):** Interfaz para procesar ficheros de microdatos adicionales y visor de líneas parseadas.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server & Client Components)
- **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS 3](https://tailwindcss.com/)
- **Visualización de Datos:** [Recharts](https://recharts.org/) + SVG Map de España interactivo
- **Iconografía:** [Lucide React](https://lucide.dev/)
- **Almacén de Datos:** SQLite nativo (`node:sqlite` en Node.js 24)

---

## 🚀 Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/jbermejo14/vehicle-stats.git
cd vehicle-stats
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) (o el puerto configurado) en tu navegador.

### 4. Scripts de Ingesta CLI
```bash
# Ingesta de un fichero individual
npm run ingest -- --limit 5000

# Ingesta masiva por lotes de todos los .zip mensuales
npx tsx scripts/ingest-all-zips.ts
```

---

## 📄 Licencia y Atribución de Datos
Datos basados en los ficheros abiertos de microdatos de matriculaciones publicados por la Dirección General de Tráfico (DGT) del Ministerio del Interior de España.
