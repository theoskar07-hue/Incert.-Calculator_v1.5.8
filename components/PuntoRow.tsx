'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Trash2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import ToleranciaInput from '@/components/ToleranciaInput'
import VarianzasExtra from '@/components/VarianzasExtra'
import { calcularPunto, fmt4, fmtSig } from '@/lib/calculos'
import { calcularTolerancia } from '@/lib/calculos'
import type { PuntoCalib, TipoCalibracion } from '@/lib/tipos'
import { NUM_LECTURAS } from '@/lib/tipos'
import { GRUPOS_UNIDADES } from '@/lib/unidades'

interface Props {
  punto: PuntoCalib
  tipo: TipoCalibracion
  index: number
  onUpdate: (p: PuntoCalib) => void
  onDelete: () => void
}

export default function PuntoRow({ punto, tipo, index, onUpdate, onDelete }: Props) {
  const [expandido, setExpandido] = useState(false)
  const n = NUM_LECTURAS[tipo]

  function setField<K extends keyof PuntoCalib>(key: K, val: PuntoCalib[K]) {
    onUpdate({ ...punto, [key]: val })
  }

  function setRdg(i: number, raw: string) {
    const newRdg = [...punto.rdg]
    newRdg[i] = raw === '' ? null : parseFloat(raw)
    onUpdate({ ...punto, rdg: newRdg })
  }

  function calcular(puntoActual: PuntoCalib = punto) {
    const res = calcularPunto(puntoActual, tipo)
    if (!res) return
    const tol = calcularTolerancia(puntoActual.configTol, puntoActual.nominal)
    onUpdate({
      ...puntoActual,
      promedio: res.promedio,
      tolerancia: tol,
      repetibilidad: res.repetibilidad,
      incertExpandida: res.incertExpandida,
      incResultado: res.incResultado,
      desviacion: res.desviacion,
      resultado: res.resultado,
    })
  }

  // Recalcular automáticamente cuando los Rdgs o el nominal cambien y haya suficientes datos
  useEffect(() => {
    const rdgsLlenos = punto.rdg.slice(0, n).every(
      r => r !== null && r !== undefined && !isNaN(Number(r))
    )
    if (rdgsLlenos && punto.nominal !== null) {
      calcular(punto)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [punto.rdg, punto.nominal, punto.incertScope, punto.configTol, tipo])

  const rdgsLlenos = punto.rdg.slice(0, n).every(
    r => r !== null && r !== undefined && !isNaN(Number(r))
  )
  const tieneNominal = punto.nominal !== null
  // incertScope ya no bloquea: puede ser null (contribuye 0)
  const puedeCalcular = rdgsLlenos && tieneNominal

  return (
    <div className="border border-border rounded-md bg-card">
      {/* ── Fila principal ── */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* expand */}
        <button
          type="button"
          onClick={() => setExpandido(p => !p)}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 w-4"
        >
          {expandido ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* index */}
        <span className="text-xs text-muted-foreground w-5 flex-shrink-0 font-mono text-center">{index + 1}</span>

        {/* Nominal */}
        <Input
          type="number"
          step="any"
          placeholder="Nominal"
          value={punto.nominal ?? ''}
          onChange={e => setField('nominal', e.target.value === '' ? null : parseFloat(e.target.value))}
          className="h-8 w-24 text-xs flex-shrink-0 font-mono"
        />

        {/* Unidad */}
        <Select value={punto.unidad} onValueChange={v => setField('unidad', v)}>
          <SelectTrigger className="h-8 w-24 text-xs flex-shrink-0">
            <SelectValue placeholder="Unidad" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            {GRUPOS_UNIDADES.map(g => (
              <SelectGroup key={g.grupo}>
                <SelectLabel className="text-xs">{g.grupo}</SelectLabel>
                {g.unidades.map(u => (
                  <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>

        {/* Rdg 1-5 */}
        {Array.from({ length: 5 }).map((_, i) => {
          const disabled = i >= n
          return (
            <Input
              key={i}
              type="number"
              step="any"
              placeholder={`Rdg${i + 1}`}
              value={punto.rdg[i] ?? ''}
              disabled={disabled}
              onChange={e => setRdg(i, e.target.value)}
              className={`h-8 w-20 text-xs flex-shrink-0 font-mono ${disabled ? 'opacity-30' : ''}`}
            />
          )
        })}

        {/* Scope (inline, mismo ancho que encabezado) */}
        <Input
          type="number"
          step="any"
          placeholder="Scope"
          value={punto.incertScope ?? ''}
          onChange={e =>
            setField('incertScope', e.target.value === '' ? null : parseFloat(e.target.value))
          }
          className="h-8 w-24 text-xs flex-shrink-0 font-mono"
          title="Incertidumbre del scope (expandida, k=2). Se usa como scope/2 en la fórmula."
        />

        {/* Promedio */}
        <span
          className="text-xs font-mono text-foreground w-24 flex-shrink-0 text-right"
          title="Promedio"
        >
          {fmt4(punto.promedio)}
        </span>

        {/* Repetibilidad — resaltada */}
        <span
          className="text-xs font-mono font-semibold text-primary w-20 flex-shrink-0 text-right bg-primary/5 rounded px-1 py-0.5"
          title="Repetibilidad — desv. estándar muestral (2 cifras sig.)"
        >
          {fmtSig(punto.repetibilidad)}
        </span>

        {/* Inc. Expandida — resaltada */}
        <span
          className="text-xs font-mono font-semibold text-primary w-24 flex-shrink-0 text-right bg-primary/5 rounded px-1 py-0.5"
          title="Incertidumbre Expandida k=2 (2 cifras sig.)"
        >
          {punto.incertExpandida !== null ? `±${fmtSig(punto.incertExpandida)}` : '—'}
        </span>

        {/* Inc. Result. — OK / NO OK */}
        <span
          className={`text-xs font-mono font-semibold w-20 flex-shrink-0 text-center rounded px-1 py-0.5 ${
            punto.incResultado === 'OK'
              ? 'bg-emerald-100 text-emerald-700'
              : punto.incResultado === 'NO OK'
              ? 'bg-red-100 text-red-700'
              : 'text-muted-foreground'
          }`}
          title="Inc. Resultado: Inc. Exp. <= uScope"
        >
          {punto.incResultado ?? '—'}
        </span>

        {/* Acciones */}
        <div className="flex items-center gap-1 w-16 flex-shrink-0 justify-end">
          <Button
            size="sm"
            variant="default"
            onClick={() => calcular(punto)}
            disabled={!puedeCalcular}
            className="h-7 w-7 p-0"
            title="Recalcular"
          >
            <Calculator className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
            title="Eliminar punto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Detalle expandido ── */}
      {expandido && (
        <div className="border-t border-border px-4 py-3 space-y-4 bg-muted/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tolerancia */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Tolerancia</p>
              <ToleranciaInput
                value={punto.configTol}
                onChange={cfg => setField('configTol', cfg)}
              />
              {punto.tolerancia !== null && (
                <p className="text-xs text-muted-foreground">
                  Calculada: <span className="font-mono font-semibold">±{punto.tolerancia}</span>
                </p>
              )}
            </div>

            {/* Notas */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-foreground">Notas</p>
              <Textarea
                placeholder="Observaciones opcionales..."
                value={punto.notas}
                onChange={e => setField('notas', e.target.value)}
                className="text-xs resize-none h-16"
              />
            </div>
          </div>

          {/* Varianzas extra */}
          <VarianzasExtra
            value={punto.varianzasExtra}
            onChange={v => setField('varianzasExtra', v)}
          />

          {/* Resumen de cálculo */}
          {punto.promedio !== null && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {[
                { label: 'Promedio', val: `${fmt4(punto.promedio)} ${punto.unidad}` },
                { label: 'Tolerancia', val: punto.tolerancia ? `±${punto.tolerancia} ${punto.unidad}` : '—' },
                { label: 'Repetibilidad', val: fmtSig(punto.repetibilidad) },
                { label: 'Inc. Exp. (k=2)', val: punto.incertExpandida !== null ? `±${fmtSig(punto.incertExpandida)} ${punto.unidad}` : '—' },
              ].map(item => (
                <div key={item.label} className="rounded p-2 text-center bg-background border border-border">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-semibold font-mono text-foreground">{item.val}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
