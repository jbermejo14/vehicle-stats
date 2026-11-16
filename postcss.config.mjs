// El orden importa: el plugin local aporta las clases detectadas (el escáner de
// Tailwind no encuentra ficheros con el binding WASI en Windows) y @tailwindcss/postcss
// las convierte en CSS. Más detalles en scripts/tailwind-wasi-sources.cjs.
export default {
  plugins: {
    './scripts/tailwind-wasi-sources.cjs': {},
    '@tailwindcss/postcss': {},
  },
};
