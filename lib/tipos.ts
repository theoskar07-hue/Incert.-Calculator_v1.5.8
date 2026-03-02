// ─────────────────────────────────────────────────────────────
// Tipos de calibración
// ─────────────────────────────────────────────────────────────
export type TipoCalibracion = 'Trazable' | 'ANAB' | 'EMA'

export const NUM_LECTURAS: Record<TipoCalibracion, number> = {
  Trazable: 3,
  ANAB: 5,
  EMA: 5,
}

// ─────────────────────────────────────────────────────────────
// Varianzas adicionales (opcionales)
// ─────────────────────────────────────────────────────────────
export interface VarianzasExtra {
  resolucion: number | null       // Resolucion / √12
  excentricidad: number | null    // Excentricidad / √3
  deriva: number | null           // Deriva / √3
  rr: number | null               // R&R / √3
  sensibilidad: number | null     // Error sensibilidad / √3
  temperatura: number | null      // (ΔT · coef.) / √3
  densidad: number | null         // Δρ / √3
  flotabilidad: number | null     // Corrección flot. / √3
}

export const VARIANZAS_EXTRA_DEFAULT: VarianzasExtra = {
  resolucion: null,
  excentricidad: null,
  deriva: null,
  rr: null,
  sensibilidad: null,
  temperatura: null,
  densidad: null,
  flotabilidad: null,
}

// ─────────────────────────────────────────────────────────────
// Modo de tolerancia
// ─────────────────────────────────────────────────────────────
export type ModoTolerancia = 'manual' | 'pct_rdg' | 'pct_fs' | 'combinada'

export interface ConfigTolerancia {
  modo: ModoTolerancia
  valor: number          // manual: valor directo
  pctRdg: number         // % de lectura
  pctFs: number          // % de fondo de escala
  fondoEscala: number    // valor FS de referencia
  digitos: number        // dígitos extra para combinada
  resolucionDig: number  // resolución por dígito
}

export const CONFIG_TOL_DEFAULT: ConfigTolerancia = {
  modo: 'manual',
  valor: 0,
  pctRdg: 0,
  pctFs: 0,
  fondoEscala: 0,
  digitos: 0,
  resolucionDig: 0,
}

// ─────────────────────────────────────────────────────────────
// Punto de calibración (una fila de la tabla)
// ─────────────────────────────────────────────────────────────
export interface PuntoCalib {
  id: string
  nominal: number | null
  unidad: string
  rdg: (number | null)[]          // 3 o 5 lecturas
  configTol: ConfigTolerancia
  incertScope: number | null      // Incertidumbre del scope (expandida)
  varianzasExtra: VarianzasExtra
  notas: string
  // Calculados (se persisten para historial)
  promedio: number | null
  tolerancia: number | null
  repetibilidad: number | null    // 2 cifras sig.
  incertExpandida: number | null  // 2 cifras sig.
  incResultado: 'OK' | 'NO OK' | null  // Inc. Exp. <= uScope
  desviacion: number | null
  resultado: 'PASA' | 'FALLA' | null
}

export function nuevoPunto(n: number): PuntoCalib {
  return {
    id: crypto.randomUUID(),
    nominal: null,
    unidad: '',
    rdg: Array(n).fill(null),
    configTol: { ...CONFIG_TOL_DEFAULT },
    incertScope: null,
    varianzasExtra: { ...VARIANZAS_EXTRA_DEFAULT },
    notas: '',
    promedio: null,
    tolerancia: null,
    repetibilidad: null,
    incertExpandida: null,
    incResultado: null,
    desviacion: null,
    resultado: null,
  }
}

// ─────────────────────────────────────────────────────────────
// Magnitud (parámetro)
// ─────────────────────────────────────────────────────────────
export interface Magnitud {
  id: string
  nombre: string                 // Ej: "Voltaje DC", "Temperatura"
  puntos: PuntoCalib[]
}

export function nuevaMagnitud(): Magnitud {
  return {
    id: crypto.randomUUID(),
    nombre: '',
    puntos: [],
  }
}

// ─────────────────────────────────────────────────────────────
// Equipo
// ─────────────────────────────────────────────────────────────
export interface Equipo {
  id: string
  fechaCreacion: string
  fechaModificacion: string
  descripcion: string
  tipoCalibracion: TipoCalibracion
  resolucion: string
  notas: string
  magnitudes: Magnitud[]
}

export function nuevoEquipo(): Equipo {
  return {
    id: crypto.randomUUID(),
    fechaCreacion: new Date().toLocaleString('es-MX'),
    fechaModificacion: new Date().toLocaleString('es-MX'),
    descripcion: '',
    tipoCalibracion: 'Trazable',
    resolucion: '',
    notas: '',
    magnitudes: [],
  }
}
