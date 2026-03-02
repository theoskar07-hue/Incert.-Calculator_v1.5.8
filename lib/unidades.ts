export interface GrupoUnidades {
  grupo: string
  unidades: string[]
}

export const GRUPOS_UNIDADES: GrupoUnidades[] = [
  {
    grupo: 'Voltaje',
    unidades: ['mV', 'V', 'kV'],
  },
  {
    grupo: 'Corriente',
    unidades: ['mA', 'A', 'µA'],
  },
  {
    grupo: 'Resistencia',
    unidades: ['mΩ', 'Ω', 'kΩ', 'MΩ'],
  },
  {
    grupo: 'Presión',
    unidades: ['Pa', 'kPa', 'MPa', 'bar', 'mbar', 'PSI', 'mmHg', 'inH2O', 'inWC', 'cmH2O'],
  },
  {
    grupo: 'Temperatura',
    unidades: ['°C', '°F', 'K'],
  },
  {
    grupo: 'Humedad',
    unidades: ['%RH'],
  },
  {
    grupo: 'Fuerza / Torque',
    unidades: ['N', 'kN', 'lb.f', 'kgf', 'gf', 'in.lb', 'N·m', 'kN·m'],
  },
  {
    grupo: 'Masa',
    unidades: ['g', 'kg', 'lb', 'oz', 'mg', 't'],
  },
  {
    grupo: 'Longitud',
    unidades: ['mm', 'cm', 'm', 'in', 'µm'],
  },
  {
    grupo: 'Frecuencia',
    unidades: ['Hz', 'kHz', 'MHz'],
  },
  {
    grupo: 'Tiempo',
    unidades: ['s', 'ms', 'min', 'h'],
  },
  {
    grupo: 'Velocidad',
    unidades: ['rpm', 'm/s', 'km/h'],
  },
  {
    grupo: 'Flujo',
    unidades: ['L/min', 'L/h', 'm³/h', 'GPM', 'SCFM'],
  },
  {
    grupo: 'Otro',
    unidades: ['%', 'ppm', 'ppb', 'dB', 'lux', 'cd'],
  },
]

export const TODAS_LAS_UNIDADES: string[] = GRUPOS_UNIDADES.flatMap(g => g.unidades)
