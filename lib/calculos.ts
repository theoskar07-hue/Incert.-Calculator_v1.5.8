import type {
  PuntoCalib,
  ConfigTolerancia,
  VarianzasExtra,
  TipoCalibracion,
} from './tipos'
import { NUM_LECTURAS } from './tipos'

// ─────────────────────────────────────────────────────────────
// Cifras significativas
// ─────────────────────────────────────────────────────────────
export function cifrasSig(num: number, sig = 2): number {
  if (!isFinite(num) || num === 0) return 0
  const exp = Math.floor(Math.log10(Math.abs(num)))
  const factor = Math.pow(10, sig - 1 - exp)
  return Math.round(num * factor) / factor
}

export function fmtSig(num: number | null, sig = 2): string {
  if (num === null || !isFinite(num)) return '—'
  return cifrasSig(num, sig).toString()
}

export function fmt4(num: number | null): string {
  if (num === null || !isFinite(num)) return '—'
  return num.toFixed(4)
}

// ─────────────────────────────────────────────────────────────
// Tolerancia
// ─────────────────────────────────────────────────────────────
export function calcularTolerancia(cfg: ConfigTolerancia, nominal: number | null): number | null {
  if (nominal === null) return null
  const abs = Math.abs(nominal)

  switch (cfg.modo) {
    case 'manual':
      return cfg.valor > 0 ? cfg.valor : null

    case 'pct_rdg':
      return cfg.pctRdg > 0 ? (abs * cfg.pctRdg) / 100 : null

    case 'pct_fs':
      return cfg.pctFs > 0 && cfg.fondoEscala > 0
        ? (cfg.fondoEscala * cfg.pctFs) / 100
        : null

    case 'combinada':
      // ±(% Rdg + % FS + n dígitos)
      return (
        (abs * cfg.pctRdg) / 100 +
        (cfg.fondoEscala * cfg.pctFs) / 100 +
        cfg.digitos * cfg.resolucionDig
      )

    default:
      return null
  }
}

// ─────────────────────────────────────────────────────────────
// Varianzas extra (contribuciones estándar)
// ─────────────────────────────────────────────────────────────
export function calcularVarianzaExtra(v: VarianzasExtra): number {
  const contrib: number[] = []

  if (v.resolucion !== null && v.resolucion > 0)
    contrib.push(v.resolucion / Math.sqrt(12))

  if (v.excentricidad !== null && v.excentricidad > 0)
    contrib.push(v.excentricidad / Math.sqrt(3))

  if (v.deriva !== null && v.deriva > 0)
    contrib.push(v.deriva / Math.sqrt(3))

  if (v.rr !== null && v.rr > 0)
    contrib.push(v.rr / Math.sqrt(3))

  if (v.sensibilidad !== null && v.sensibilidad > 0)
    contrib.push(v.sensibilidad / Math.sqrt(3))

  if (v.temperatura !== null && v.temperatura > 0)
    contrib.push(v.temperatura / Math.sqrt(3))

  if (v.densidad !== null && v.densidad > 0)
    contrib.push(v.densidad / Math.sqrt(3))

  if (v.flotabilidad !== null && v.flotabilidad > 0)
    contrib.push(v.flotabilidad / Math.sqrt(3))

  return contrib.reduce((sum, c) => sum + c * c, 0)
}

// ─────────────────────────────────────────────────────────────
// Cálculo principal de un punto
// ─────────────────────────────────────────────────────────────
export interface ResultadoPunto {
  promedio: number
  tolerancia: number | null
  repetibilidad: number           // desviación estándar muestral
  incertExpandida: number         // U expandida k=2
  incResultado: 'OK' | 'NO OK'   // Inc. Exp. <= uScope
  desviacion: number
  resultado: 'PASA' | 'FALLA'
}

export function calcularPunto(
  punto: PuntoCalib,
  tipo: TipoCalibracion
): ResultadoPunto | null {
  const n = NUM_LECTURAS[tipo]

  // Tomar solo las n lecturas que corresponden al tipo y filtrar nulos/NaN
  const lecturas = punto.rdg
    .slice(0, n)
    .map(r => (r === null || r === undefined ? NaN : Number(r)))
    .filter(r => !isNaN(r))

  if (lecturas.length < n) return null
  if (punto.nominal === null) return null

  // ── Promedio ──────────────────────────────────────────────
  const promedio = lecturas.reduce((a, b) => a + b, 0) / n

  // ── Desviación estándar muestral ──────────────────────────
  // s = √[ Σ(xi - x̄)² / (n-1) ]
  const varianza = lecturas.reduce((s, v) => s + Math.pow(v - promedio, 2), 0) / (n - 1)
  const s = Math.sqrt(varianza)

  // ── Repetibilidad (mostrada) = desv. estándar muestral ───
  // Según enunciado: "Es la desviación estándar de las lecturas"
  const repetibilidad = s

  // ── Componente Tipo A para incertidumbre: s/√n ────────────
  const uA = s / Math.sqrt(n)

  // ── Incertidumbre del scope/patrón → convertir a estándar ─
  // El certificado proporciona U expandida (k=2), se divide /2
  const uScope = punto.incertScope !== null && !isNaN(Number(punto.incertScope)) && Number(punto.incertScope) > 0
    ? Number(punto.incertScope) / 2
    : 0

  // ── Varianzas extra (contribuciones adicionales Tipo B) ───
  const varExtra = calcularVarianzaExtra(punto.varianzasExtra)

  // ── Incertidumbre combinada ────────────────────────────────
  // uc = √( uA² + uScope² + varExtra )
  const uc = Math.sqrt(uA * uA + uScope * uScope + varExtra)

  // ── Incertidumbre expandida (k=2) ─────────────────────────
  // U = √( (s/√n)² + (scope/2)² ) × 2
  // (equivale a uc × 2 cuando no hay varianzas extra)
  const incertExpandida = uc * 2

  // ── Tolerancia ────────────────────────────────────────────
  const tolerancia = calcularTolerancia(punto.configTol, punto.nominal)

  // ── Desviación: Nominal − Promedio ────────────────────────
  const desviacion = punto.nominal - promedio

  // ── PASA / FALLA ──────────────────────────────────────────
  const resultado: 'PASA' | 'FALLA' =
    tolerancia !== null && Math.abs(desviacion) <= tolerancia ? 'PASA' : 'FALLA'

  // ── Inc. Result: Inc. Exp. <= uScope ──────────────────────
  // OK si la incertidumbre expandida calculada es menor o igual al scope del certificado
  const incExpandidaFinal = cifrasSig(incertExpandida, 2)
  const incResultado: 'OK' | 'NO OK' =
    punto.incertScope !== null && Number(punto.incertScope) > 0
      ? incExpandidaFinal <= Number(punto.incertScope) ? 'OK' : 'NO OK'
      : 'OK'

  return {
    promedio,
    tolerancia,
    repetibilidad: cifrasSig(repetibilidad, 2),
    incertExpandida: incExpandidaFinal,
    incResultado,
    desviacion,
    resultado,
  }
}
