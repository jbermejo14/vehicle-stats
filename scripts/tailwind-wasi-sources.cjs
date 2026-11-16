/**
 * Plugin de PostCSS que suple la detección automática de clases de Tailwind CSS 4
 * cuando se usa el binding WASI de @tailwindcss/oxide.
 *
 * Por qué existe: en este entorno Windows el binario nativo de oxide está bloqueado
 * por una política de Control de Aplicaciones y se carga la versión WASI
 * (@tailwindcss/oxide-wasm32-wasi). Ese binding recorre el sistema de ficheros con
 * rutas del tipo "C:\Users\..." que WASI no sabe resolver, así que el escáner de
 * Tailwind no encuentra ningún fichero, no detecta ninguna clase y el CSS final solo
 * lleva el preflight y el tema. El análisis de contenido en memoria (scanFiles con
 * `content`) sí funciona.
 *
 * Qué hace: lee con fs los ficheros fuente, extrae los candidatos con el escáner de
 * oxide y los añade a la hoja de estilos como `@source inline("...")`, que
 * @tailwindcss/postcss procesa a continuación. Debe declararse en postcss.config.mjs
 * ANTES de @tailwindcss/postcss.
 *
 * Con el binding nativo funciona igual (los candidatos se duplican sin efecto).
 */
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SOURCE_DIRECTORIES = ['app', 'components', 'context', 'lib'];
const SOURCE_EXTENSIONS = new Set(['tsx', 'ts', 'jsx', 'js', 'mdx', 'html']);
const NAPI_FORCE_WASI_VARIABLE = 'NAPI_RS_FORCE_WASI';
// Caracteres que romperían la cadena de `@source inline("...")` o activarían su
// expansión de llaves. Ninguna clase de este proyecto los usa.
const UNSAFE_CANDIDATE_PATTERN = /["\\{}]/;

function sourceExtensionOf(fileName) {
  const extension = path.extname(fileName).slice(1);
  return SOURCE_EXTENSIONS.has(extension) ? extension : null;
}

function collectSourceFiles(directory, collected) {
  if (!fs.existsSync(directory)) return collected;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(fullPath, collected);
    } else if (sourceExtensionOf(entry.name)) {
      collected.push({ file: fullPath, extension: sourceExtensionOf(entry.name) });
    }
  }
  return collected;
}

function loadScanner() {
  // Mismo criterio que next.config.js: el binding nativo está bloqueado, se fuerza WASI.
  if (!process.env[NAPI_FORCE_WASI_VARIABLE]) process.env[NAPI_FORCE_WASI_VARIABLE] = 'true';
  return require('@tailwindcss/oxide').Scanner;
}

function extractCandidates() {
  const Scanner = loadScanner();
  const inputs = SOURCE_DIRECTORIES
    .flatMap((directory) => collectSourceFiles(path.join(PROJECT_ROOT, directory), []))
    .map(({ file, extension }) => ({ content: fs.readFileSync(file, 'utf8'), extension }));
  const candidates = new Scanner({}).scanFiles(inputs);
  return [...new Set(candidates)].filter((candidate) => !UNSAFE_CANDIDATE_PATTERN.test(candidate));
}

function createTailwindWasiSources() {
  return {
    postcssPlugin: 'tailwind-wasi-sources',
    Once(root, { AtRule, result }) {
      root.append(new AtRule({ name: 'source', params: `inline("${extractCandidates().join(' ')}")` }));
      for (const directory of SOURCE_DIRECTORIES) {
        // Para que el modo desarrollo vuelva a procesar el CSS al cambiar las clases.
        result.messages.push({
          type: 'dir-dependency',
          plugin: 'tailwind-wasi-sources',
          dir: path.join(PROJECT_ROOT, directory),
          glob: '**/*',
          parent: result.opts.from,
        });
      }
    },
  };
}
createTailwindWasiSources.postcss = true;

module.exports = createTailwindWasiSources;
