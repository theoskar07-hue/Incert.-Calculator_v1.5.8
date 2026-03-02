'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { VarianzasExtra as VE } from '@/lib/tipos'

interface Props {
  value: VE
  onChange: (v: VE) => void
}

const CAMPOS: { key: keyof VE; label: string; formula: string }[] = [
  { key: 'resolucion',   label: 'Resolución',   formula: 'Res / √12' },
  { key: 'excentricidad',label: 'Excentricidad', formula: 'Exc / √3' },
  { key: 'deriva',       label: 'Deriva',        formula: 'Der / √3' },
  { key: 'rr',           label: 'R&R',           formula: 'R&R / √3' },
  { key: 'sensibilidad', label: 'Sensibilidad',  formula: 'Err / √3' },
  { key: 'temperatura',  label: 'Temperatura',   formula: '(ΔT·coef) / √3' },
  { key: 'densidad',     label: 'Densidad',      formula: 'Δρ / √3' },
  { key: 'flotabilidad', label: 'Flotabilidad',  formula: 'Flot / √3' },
]

export default function VarianzasExtra({ value, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  const activos = Object.values(value).filter(v => v !== null && v > 0).length

  function set(key: keyof VE, raw: string) {
    const n = raw === '' ? null : parseFloat(raw)
    onChange({ ...value, [key]: isNaN(n as number) ? null : n })
  }

  return (
    <div className="border border-dashed border-border rounded-md">
      <button
        type="button"
        onClick={() => setAbierto(p => !p)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          {abierto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          Varianzas adicionales
          {activos > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {activos}
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground/60">Opcional</span>
      </button>

      {abierto && (
        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-dashed border-border pt-3">
          {CAMPOS.map(({ key, label, formula }) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">
                {label}
                <span className="ml-1 text-muted-foreground/60 font-normal">({formula})</span>
              </Label>
              <Input
                type="number"
                step="any"
                placeholder="0"
                value={value[key] ?? ''}
                onChange={e => set(key, e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
