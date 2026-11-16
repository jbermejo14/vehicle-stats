# DGT Pulse // Estadísticas de matriculaciones a partir de los microdatos de la DGT 🚗⚡📊

> Portal de analítica de datos y estadísticas de matriculaciones en España generado estáticamente (**SSG**) a partir de los microdatos de la **Dirección General de Tráfico (DGT)** (`MATRABA`). Es un proyecto independiente: no es un sitio oficial ni está afiliado a la DGT.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Microdatos DGT](https://img.shields.io/badge/DGT-Microdatos-0055A5?style=flat-square)](https://sedeinvestigacion.dgt.es/es/datos-abiertos/microdatos/)

---

## ⚡ Descripción del Proyecto

**DGT Pulse** es una plataforma web orientada al análisis riguroso y transparente del parque de vehículos matriculados en España. Cada cifra, tabla y gráfico procede de los microdatos mensuales que publica la Dirección General de Tráfico en su registro de ancho fijo `MATRABA` (714 caracteres por registro), sin estimaciones opacas ni datos sintéticos.

La arquitectura web está construida con **Next.js (App Router)** en modo **Static Site Generation (SSG)**: todas las páginas se generan en tiempo de compilación a partir de conjuntos de datos JSON pre-agregados y versionados en el repositorio (`data/aggregated/`). No hay dependencias de bases de datos SQLite en tiempo de ejecución web, lo que permite un despliegue estático o en cualquier hosting serverless con tiempos de respuesta óptimos y coste de infraestructura mínimo.

---

## 🧭 Estructura de Páginas y SEO Programático

El sitio genera automáticamente URLs canónicas con metadatos Open Graph, datos estructurados Schema.org (`BreadcrumbList` y `Dataset`) y sitemap XML sin fragmentos de anclaje (`#`):

- **`/`**: Cuadro de mando resumen del último mes consolidado y del último año natural cerrado.
- **`/matriculaciones/[año]`**: Totales anuales, evolución interanual (YoY), cuota por tipo de propulsión y distintivo ambiental DGT, y marcas/modelos líderes.
- **`/matriculaciones/[año]/[mes]`**: Análisis mensual detallado, comparativa frente al mismo mes del año precedente y ranking provincial.
- **`/provincia/[provincia]`**: Serie histórica de matriculaciones de cada una de las 52 provincias españolas y ciudades autónomas, mix de combustibles y tasa de motorización per cápita (matriculaciones por cada 1.000 habitantes según el Padrón INE 2024).
- **`/marca/[marca]`**: Evolución temporal por fabricante, provincias con mayor penetración, tecnologías de propulsión y modelos matriculados. (Aplica un umbral mínimo configurable de `MIN_REGISTRATIONS_THRESHOLD = 50` para evitar páginas vacías o con baja representatividad).
- **`/marca/[marca]/[modelo]`**: Ficha técnica agregada de cada modelo (potencias, masas, emisiones medias y combustibles).
- **`/electricos`**: Radiografía específica de vehículos 100% eléctricos (BEV) e híbridos enchufables (PHEV), con tendencias provinciales y ranking de marcas punteras.

---

## 📚 Fuentes de Datos y Metodología

Cada métrica mostrada en la plataforma está vinculada a una fuente documentada:

1. **Microdatos de Matriculaciones de la DGT (`MATRABA`)**:
   - Registro mensual de vehículos matriculados publicado por la DGT (Ministerio del Interior).
   - Incluye matriculaciones ordinarias, temporales, turísticas, especiales, remolques y ciclomotores.
   - El parser (`lib/dgtParser.ts`) decodifica el tipo de registro (nuevo vs. transferencia/usado en `IND_NUEVO_USADO`), clase de matrícula (`COD_CLASE_MAT`), combustible (`COD_PROPULSION_ITV`), indicador de hibridación (`IND_HIBRIDO`: `BEV`, `REE`, `PHE`, `HEV`, `MHE`), cilindrada, potencia neta (`KW`), tara y emisiones de CO₂ (WLTP/NEDC).
2. **Censo Poblacional y Ratios Per Cápita**:
   - **Instituto Nacional de Estadística (INE)**: Padrón municipal de habitantes a 1 de enero de 2024 (Real Decreto 1085/2024, de 22 de octubre).
   - Permite calcular la tasa estandarizada de matriculaciones anualizadas por cada 1.000 habitantes por provincia.
3. **Distintivos Ambientales DGT**:
   - Asignación según las resoluciones publicadas en el Boletín Oficial del Estado (**BOE núm. 96 de 21/04/2016** y **BOE núm. 18 de 20/01/2018**):
     - **0 CERO**: BEV, REEV, PHEV con autonomía $\ge 40\text{ km}$, FCEV.
     - **ECO**: MHEV, HEV, PHEV con autonomía $< 40\text{ km}$, GLP, GNC, GNL.
     - **PHEV**: los microdatos MATRABA no incluyen la autonomía eléctrica, así que no se puede saber si un PHEV lleva CERO o ECO. La web no los reparte: cuenta como CERO solo los BEV y muestra los PHEV aparte ("PHEV: CERO o ECO según autonomía eléctrica"). `deduceDgtBadge` devuelve un resultado indeterminado si no recibe la autonomía. Los recuentos `cero` de `data/aggregated/` incluyen los PHEV porque se calcularon con la regla anterior; `lib/badgeCounts.ts` los separa al mostrarlos.
     - **C**: Gasolina Euro 4, 5, 6 (matriculados desde enero 2006); Diésel Euro 6 (matriculados desde septiembre 2015).
     - **B**: Gasolina Euro 3 (matriculados desde enero 2000); Diésel Euro 4, 5 (matriculados desde enero 2006).
     - **Sin Etiqueta**: Resto de vehículos que no cumplen los requisitos anteriores.
4. **Origen Geográfico por WMI (World Manufacturer Identifier)**:
   - Norma internacional **ISO 3779**: decodificación de los 3 primeros caracteres del número de bastidor (VIN) para clasificar el país o región geográfica de fabricación/ensamblaje del fabricante (`VS` España, `WV`/`WA`/`WB` Alemania, `VF` Francia, `ZA` Italia, `JN`/`JT` Japón, `KL`/`KM` Corea, `LS`/`LB` China, etc.).

---

## 📥 Obtención de los Microdatos de la DGT

Los ficheros se descargan desde la Sede Electrónica de Investigación de la DGT:

1. Accede al portal de microdatos de la DGT:
   👉 **[https://sedeinvestigacion.dgt.es/es/datos-abiertos/microdatos/](https://sedeinvestigacion.dgt.es/es/datos-abiertos/microdatos/)**
2. Navega al apartado **Matriculaciones**.
3. Descarga los ficheros mensuales comprimidos con nomenclatura:
   `export_mensual_mat_YYYYMM.zip` (por ejemplo: `export_mensual_mat_202401.zip`).
4. Coloca los archivos `.zip` descargados en una carpeta local de tu equipo (por ejemplo: `C:\mis-descargas-dgt\` o `./data/raw/`).

> [!NOTE]
> La Sede Electrónica de la DGT no dispone actualmente de una API REST abierta sin autenticación ni tokens de sesión web para descarga directa por script CLI desatendido. Por ello, el flujo automatizado lee de la carpeta local configurada en la variable de entorno `DGT_MICRODATA_DIR`.

---

## ⚙️ Variables de Entorno

Copia `.env.example` a `.env.local` en la raíz del proyecto y ajusta los valores:

```env
# Directorio local donde se ubican los .zip o .txt de la DGT (opcional)
DGT_MICRODATA_DIR="C:/Users/Usuario/Downloads"

# URL canónica del sitio para etiquetas canonical, Open Graph y sitemap
NEXT_PUBLIC_SITE_URL="https://dgt-pulse.es"
```

Si no se define `DGT_MICRODATA_DIR`, el script de ingesta procesa automáticamente la base de datos histórica validada existente en `data/dgt_database.db`.

---

## 🚀 Instalación y Comandos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ingesta y agregación de datos
Procesa los microdatos de la DGT, valida las líneas contra el diseño de registro MATRABA, calcula los distintivos ambientales y genera los JSON estáticos en `data/aggregated/`:
```bash
npm run ingest
```

### 3. Ejecución de pruebas unitarias (sin red)
Ejecuta la suite de pruebas offline que verifica el parser, las reglas de distintivos en fechas frontera, el umbral mínimo de marcas/modelos, los slugs normalizados y el sitemap:
```bash
npm test
```

### 4. Compilación estática de producción
Genera todas las páginas estáticas optimizadas para producción:
```bash
npm run build
```

> [!NOTE]
> En equipos Windows con una política de Control de Aplicaciones que bloquea los binarios nativos, Tailwind CSS 4 usa el binding WASI (`@tailwindcss/oxide-wasm32-wasi`), cuyo escáner no encuentra ficheros en rutas de Windows y deja el CSS sin utilidades. `scripts/tailwind-wasi-sources.cjs` (declarado en `postcss.config.mjs`) suple esa detección. Next.js guarda el CSS procesado en `.next/cache`: si cambias ese plugin y el CSS no se actualiza, borra `.next` a mano y vuelve a compilar.

### 5. Iniciar servidor local
```bash
npm run dev
```
Accede a [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛡️ Atribución y Licencia

- **Datos de Matriculaciones**: Microdatos de matriculaciones abiertos de la **Dirección General de Tráfico (DGT)**, Ministerio del Interior, Gobierno de España.
- **Datos Demográficos**: Padrón Municipal de Habitantes 2024, **Instituto Nacional de Estadística (INE)**.
- **Identificación de Fabricantes**: Norma internacional **ISO 3779**.
