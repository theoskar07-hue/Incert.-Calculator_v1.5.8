'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { ConfigTolerancia, ModoTolerancia } from '@/lib/tipos'

interface Props {
  value: ConfigTolerancia
  onChange: (v: ConfigTolerancia) => void
}

const MODOS: { value: ModoTolerancia; label: string }[] = [
  { value: 'manual',    label: 'Manual' },
  { value: 'pct_rdg',   label: '% Lectura' },
  { value: 'pct_fs',    label: '% FS' },
  { value: 'combinada', label: 'Combinada' },
]

function n(raw: string) {
  const v = parseFloat(raw)
  return isNaN(v) ? 0 : v
}

export default function ToleranciaInput({ value, onChange }: Props) {
  const set = (partial: Partial<ConfigTolerancia>) => onChange({ ...value, ...partial })

  return (
    <div className="space-y-1.5">
      <Select value={value.modo} onValueChange={v => set({ modo: v as ModoTolerancia })}>
        <SelectTrigger className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODOS.map(m => (
            <SelectItem key={m.value} value={m.value} className="text-xs">
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value.modo === 'manual' && (
        <Input
          type="number"
          step="any"
          placeholder="Tolerancia"
          value={value.valor || ''}
          onChange={e => set({ valor: n(e.target.value) })}
          className="h-8 text-xs"
        />
      )}

      {value.modo === 'pct_rdg' && (
        <Input
          type="number"
          step="any"
          placeholder="% Rdg"
          value={value.pctRdg || ''}
          onChange={e => set({ pctRdg: n(e.target.value) })}
          className="h-8 text-xs"
        />
      )}

      {value.modo === 'pct_fs' && (
        <div className="flex gap-1">
          <Input
            type="number"
            step="any"
            placeholder="% FS"
            value={value.pctFs || ''}
            onChange={e => set({ pctFs: n(e.target.value) })}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            step="any"
            placeholder="FS"
            value={value.fondoEscala || ''}
            onChange={e => set({ fondoEscala: n(e.target.value) })}
            className="h-8 text-xs"
          />
        </div>
      )}

      {value.modo === 'combinada' && (
        <div className="grid grid-cols-2 gap-1">
          <Input
            type="number"
            step="any"
            placeholder="% Rdg"
            value={value.pctRdg || ''}
            onChange={e => set({ pctRdg: n(e.target.value) })}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            step="any"
            placeholder="% FS"
            value={value.pctFs || ''}
            onChange={e => set({ pctFs: n(e.target.value) })}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            step="any"
            placeholder="FS valor"
            value={value.fondoEscala || ''}
            onChange={e => set({ fondoEscala: n(e.target.value) })}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            step="any"
            placeholder="n dígitos"
            value={value.digitos || ''}
            onChange={e => set({ digitos: n(e.target.value) })}
            className="h-8 text-xs"
          />
          <Input
            type="number"
            step="any"
            placeholder="Res. dígito"
            value={value.resolucionDig || ''}
            onChange={e => set({ resolucionDig: n(e.target.value) })}
            className="h-8 text-xs col-span-2"
          />
        </div>
      )}
    </div>
  )
}
