/**
 * Recuentos de etiquetas ambientales a partir de los agregados de data/aggregated.
 *
 * Los agregados se calcularon asignando CERO a todos los PHEV, porque MATRABA no
 * trae la autonomía eléctrica. Según la DGT, un PHEV lleva CERO solo con 40 km o
 * más de autonomía y ECO en caso contrario, así que el recuento "cero" de los
 * agregados mezcla BEV y PHEV. Estas funciones separan ambos grupos sin inventar
 * ningún reparto: el PHEV se muestra aparte.
 */

/** Texto que se muestra junto a los PHEV, cuya etiqueta depende de su autonomía. */
export const PHEV_BADGE_NOTE = 'PHEV: CERO o ECO según autonomía eléctrica';

/** Vehículos con etiqueta CERO segura (BEV): el recuento de los agregados menos los PHEV. */
export function certainCeroCount(aggregatedCero: number, phevCount: number): number {
  return Math.max(0, aggregatedCero - phevCount);
}

/** Porcentaje de una parte sobre un total, con un decimal por defecto; 0 si el total es 0. */
export function percentageOf(part: number, total: number, decimals = 1): number {
  if (total <= 0) return 0;
  return parseFloat(((part / total) * 100).toFixed(decimals));
}
